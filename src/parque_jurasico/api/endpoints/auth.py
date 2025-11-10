from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from fastapi_mail import MessageSchema
from src.parque_jurasico.security import seguridad
from src.parque_jurasico.modelos import dinosaurio as modelos
from src.parque_jurasico.bd.BaseDatos import get_db_session
from src.parque_jurasico.modelos.dinosaurio import Usuario as UsuarioDBModel
from src.parque_jurasico.modelos.dinosaurio import EmailVerificationToken
from src.parque_jurasico.core.email_config import (
    fm,
    create_jurassic_park_email_template,
    generate_verification_code
)
from sqlalchemy.future import select

router = APIRouter()


class ForcePasswordChangePayload(BaseModel):
    new_username: EmailStr
    new_password: str


class VerifyEmailPayload(BaseModel):
    email: EmailStr
    token: str


PASSWORD_POLICY_ERROR = "La contraseña no cumple con los requisitos LOPD: Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (!@#$%^&*())"



@router.post("/token", response_model=modelos.Token)
async def login_para_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: AsyncSession = Depends(get_db_session)
):
    usuario = await seguridad.get_user_by_username(db, form_data.username)

    if not usuario or not seguridad.verificar_contrasena(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrecto",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Correo no verificado. Por favor, revisa tu bandeja de entrada.",
        )

    expires_delta = timedelta(minutes=seguridad.MINUTOS_EXPIRACION_TOKEN)
    force_change = usuario.must_change_password

    access_token = seguridad.crear_token_acceso(
        data={"sub": usuario.username, "role": usuario.role},
        expires_delta=expires_delta
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "must_change_password": force_change
    }


@router.get("/me", response_model=modelos.UsuarioAuth)
async def leer_usuario_actual(usuario_actual: models.UsuarioAuth = Depends(seguridad.obtener_usuario_actual)):
    return usuario_actual


@router.post("/register", response_model=modelos.UsuarioAuth, status_code=201)
async def registrar_usuario(
        user_in: modelos.UserCreate,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db_session)
):
    usuario_existente = await seguridad.get_user_by_username(db, user_in.username)
    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El correo electrónico ya está registrado",
        )

    if not seguridad.validar_contrasena_rex(user_in.password):
        raise HTTPException(
            status_code=400,
            detail=PASSWORD_POLICY_ERROR,
        )

    hashed_password = seguridad.hashear_contrasena(user_in.password)

    nuevo_usuario_db = UsuarioDBModel(
        username=user_in.username,
        nombre=user_in.nombre,
        apellidos=user_in.apellidos,
        hashed_password=hashed_password,
        role="visitante",
        acepta_publicidad=user_in.acepta_publicidad,
        is_active=False,
        must_change_password=False
    )

    db.add(nuevo_usuario_db)
    await db.commit()
    await db.refresh(nuevo_usuario_db)

    try:
        token_code = generate_verification_code()
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=20)

        verification_token = EmailVerificationToken(
            token=token_code,
            expires_at=expires_at,
            user_id=nuevo_usuario_db.id
        )
        db.add(verification_token)
        await db.commit()

        html_content = create_jurassic_park_email_template(token_code, nuevo_usuario_db.nombre)
        message = MessageSchema(
            subject="[Jurassic Park] Código de Verificación de Cuenta",
            recipients=[nuevo_usuario_db.username],
            body=html_content,
            subtype="html"
        )

        background_tasks.add_task(fm.send_message, message)
        print(f"Email de verificación enviado a: {nuevo_usuario_db.username}")

    except Exception as e:
        print(f"Error al enviar email o crear token: {e}")

    print(f"Nuevo usuario registrado (inactivo): {nuevo_usuario_db.username}")

    return modelos.UsuarioAuth(
        username=nuevo_usuario_db.username,
        role=nuevo_usuario_db.role
    )


@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
        payload: VerifyEmailPayload,
        db: AsyncSession = Depends(get_db_session)
):
    usuario_db = await seguridad.get_user_by_username(db, payload.email)
    if not usuario_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if usuario_db.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La cuenta ya está activa")

    result = await db.execute(
        select(EmailVerificationToken).where(
            EmailVerificationToken.user_id == usuario_db.id,
            EmailVerificationToken.token == payload.token
        )
    )
    token_db = result.scalars().first()

    if not token_db:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Código de verificación inválido")

    if token_db.is_expired():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El código ha expirado")

    usuario_db.is_active = True
    db.add(usuario_db)
    await db.delete(token_db)
    await db.commit()

    return {"message": "¡Verificación completada! Ya puedes iniciar sesión."}


@router.post("/auth/force-change-password", status_code=status.HTTP_204_NO_CONTENT)
async def force_change_password(
        payload: ForcePasswordChangePayload,
        current_user: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)
):
    usuario_db = await seguridad.get_user_by_username(db, current_user.username)

    if not usuario_db:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if payload.new_username != usuario_db.username:
        nuevo_username_existente = await seguridad.get_user_by_username(db, payload.new_username)
        if nuevo_username_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nuevo nombre de usuario (email) ya está en uso."
            )

    if not seguridad.validar_contrasena_rex(payload.new_password):
        raise HTTPException(
            status_code=400,
            detail=PASSWORD_POLICY_ERROR,
        )

    usuario_db.username = payload.new_username
    usuario_db.hashed_password = seguridad.hashear_contrasena(payload.new_password)
    usuario_db.must_change_password = False

    db.add(usuario_db)
    await db.commit()

    return NoneS