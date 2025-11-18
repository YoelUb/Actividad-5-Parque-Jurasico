from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ...bd.BaseDatos import get_db_session
from ...security import seguridad
from ...modelos import dinosaurio as modelos
from ...modelos.dinosaurio import Usuario as UsuarioDBModel
from ...core import email_config
from datetime import timedelta, datetime, timezone
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

router = APIRouter()


@router.post("/token", response_model=modelos.Token)
async def login_para_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(UsuarioDBModel).where(UsuarioDBModel.username == form_data.username))
    usuario = result.scalars().first()

    if not usuario or not seguridad.verificar_contrasena(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not usuario.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Por favor, verifica tu correo electrónico."
        )

    access_token_expires = timedelta(minutes=seguridad.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = seguridad.crear_token_acceso(
        data={"sub": usuario.username, "role": usuario.role},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "must_change_password": usuario.must_change_password
    }


@router.post("/register")
async def register_user(
        user: modelos.UserCreate,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db_session)
):
    if not seguridad.validar_contrasena_rex(user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña no cumple con los requisitos de seguridad."
        )

    result = await db.execute(select(UsuarioDBModel).where(UsuarioDBModel.username == user.username))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")

    hashed_password = seguridad.hashear_contrasena(user.password)

    usuario_db = UsuarioDBModel(
        username=user.username,
        nombre=user.nombre,
        apellidos=user.apellidos,
        hashed_password=hashed_password,
        acepta_publicidad=user.acepta_publicidad,
        is_active=False
    )

    db.add(usuario_db)
    await db.commit()
    await db.refresh(usuario_db)

    verification_code = email_config.generate_verification_code()
    token_db = modelos.EmailVerificationToken(
        token=verification_code,
        user_id=usuario_db.id,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=20)
    )
    db.add(token_db)
    await db.commit()

    html_content = email_config.create_jurassic_park_email_template(
        code=verification_code,
        nombre_usuario=usuario_db.nombre
    )

    message = email_config.MessageSchema(
        subject="¡Bienvenido a Jurassic Park! Confirma tu correo",
        recipients=[usuario_db.username],
        body=html_content,
        subtype=email_config.MessageType.html
    )

    background_tasks.add_task(email_config.fm.send_message, message)

    return {"message": "Usuario registrado. Por favor, revisa tu correo para el código de verificación."}


@router.post("/verify-email")
async def verify_email(
        data: modelos.VerificationRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(UsuarioDBModel).where(UsuarioDBModel.username == data.email))
    usuario_db = result.scalars().first()

    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario_db.is_active:
        return {"message": "El correo ya ha sido verificado."}

    query = select(modelos.EmailVerificationToken). \
        where(modelos.EmailVerificationToken.user_id == usuario_db.id). \
        order_by(modelos.EmailVerificationToken.expires_at.desc())

    result = await db.execute(query)
    token_db = result.scalars().first()

    if not token_db or token_db.token != data.code:
        raise HTTPException(status_code=400, detail="Código de verificación inválido")

    if token_db.is_expired():
        raise HTTPException(status_code=400, detail="El código de verificación ha expirado")

    usuario_db.is_active = True
    await db.delete(token_db)
    await db.commit()

    try:
        login_url = email_config.settings.FRONTEND_DOMAIN

        html_content = email_config.create_confirmation_email_template(
            nombre_usuario=usuario_db.nombre,
            email_usuario=usuario_db.username,
            login_url=login_url
        )

        message = email_config.MessageSchema(
            subject="¡Tu cuenta de Jurassic Park ha sido verificada!",
            recipients=[usuario_db.username],
            body=html_content,
            subtype=email_config.MessageType.html
        )

        background_tasks.add_task(email_config.fm.send_message, message)
    except Exception as e:
        print(f"Error al enviar email de confirmación a {usuario_db.username}: {e}")

    return {"message": "Correo verificado exitosamente. Ya puedes iniciar sesión."}


@router.get("/me", response_model=modelos.UsuarioAuth)
async def read_users_me(current_user: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual)):
    return current_user


@router.post("/force-change-password")
async def force_change_password(
        password_data: modelos.NewPassword,
        db: AsyncSession = Depends(get_db_session),
        current_user: UsuarioDBModel = Depends(seguridad.get_current_user_force_change)
):
    if not seguridad.validar_contrasena_rex(password_data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña no cumple con los requisitos de seguridad."
        )

    if current_user.username != password_data.new_username:
        result = await db.execute(
            select(UsuarioDBModel).where(UsuarioDBModel.username == password_data.new_username)
        )
        existing_user = result.scalars().first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nuevo correo electrónico ya está registrado."
            )

        current_user.username = password_data.new_username

    current_user.hashed_password = seguridad.hashear_contrasena(password_data.new_password)
    current_user.must_change_password = False

    await db.commit()

    return {"message": "Usuario y contraseña actualizados exitosamente. Por favor, inicie sesión de nuevo."}



@router.post("/password-recovery/{email}")
async def request_password_reset(
        email: EmailStr,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db_session)
):
    """
    Inicia el proceso de reseteo de contraseña.
    No revela si el email existe o no.
    """
    result = await db.execute(select(UsuarioDBModel).where(UsuarioDBModel.username == email))
    usuario = result.scalars().first()

    if usuario:
        # Generar un token JWT corto y específico para el reseteo
        reset_token_expires = timedelta(minutes=15)
        reset_token = seguridad.crear_token_acceso(
            data={"sub": usuario.username, "purpose": "password_reset"},
            expires_delta=reset_token_expires
        )

        reset_url = f"{email_config.settings.FRONTEND_DOMAIN}/reset-password?token={reset_token}"

        html_content = email_config.create_password_reset_email_template(
            reset_url=reset_url,
            nombre_usuario=usuario.nombre
        )

        message = email_config.MessageSchema(
            subject="Reestablece tu contraseña de Jurassic Park",
            recipients=[usuario.username],
            body=html_content,
            subtype=email_config.MessageType.html
        )
        background_tasks.add_task(email_config.fm.send_message, message)

    return {"mensaje": "Si este correo está registrado, recibirás un enlace para reestablecer tu contraseña."}


@router.post("/reset-password/")
async def perform_password_reset(
        data: modelos.PasswordResetRequest,
        db: AsyncSession = Depends(get_db_session)
):
    """
    Ejecuta el cambio de contraseña usando el token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="El token es inválido o ha expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(data.token, seguridad.SECRET_KEY, algorithms=[seguridad.ALGORITHM])
        username: str = payload.get("sub")
        purpose: str = payload.get("purpose")

        if username is None or purpose != "password_reset":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    result = await db.execute(select(UsuarioDBModel).where(UsuarioDBModel.username == username))
    usuario = result.scalars().first()

    if usuario is None:
        raise credentials_exception

    if not seguridad.validar_contrasena_rex(data.new_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña no cumple con los requisitos de seguridad."
        )

    usuario.hashed_password = seguridad.hashear_contrasena(data.new_password)
    usuario.must_change_password = False
    await db.commit()

    return {"mensaje": "Contraseña actualizada exitosamente."}


@router.post("/resend-verification-code")
async def resend_verification_code(
        data: modelos.VerificationRequest,
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(UsuarioDBModel).where(UsuarioDBModel.username == data.email))
    usuario = result.scalars().first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if usuario.is_active:
        return {"message": "Esta cuenta ya está verificada."}

    query = select(modelos.EmailVerificationToken). \
        where(modelos.EmailVerificationToken.user_id == usuario.id). \
        order_by(modelos.EmailVerificationToken.expires_at.desc())

    result = await db.execute(query)
    ultimo_token = result.scalars().first()

    if ultimo_token:
        tiempo_restante = ultimo_token.expires_at - datetime.now(timezone.utc)
        if tiempo_restante > timedelta(minutes=5):
            minutos_espera = int((tiempo_restante.total_seconds() / 60) - 5)
            if minutos_espera < 1: minutos_espera = 1
            raise HTTPException(
                status_code=429,
                detail=f"Por favor espera {minutos_espera} minutos antes de solicitar otro código."
            )

    verification_code = email_config.generate_verification_code()
    token_db = modelos.EmailVerificationToken(
        token=verification_code,
        user_id=usuario.id,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=20)
    )
    db.add(token_db)
    await db.commit()

    html_content = email_config.create_jurassic_park_email_template(
        code=verification_code,
        nombre_usuario=usuario.nombre
    )

    message = email_config.MessageSchema(
        subject="Nuevo código de verificación - Jurassic Park",
        recipients=[usuario.username],
        body=html_content,
        subtype=email_config.MessageType.html
    )
    background_tasks.add_task(email_config.fm.send_message, message)

    return {"message": "Nuevo código enviado. Revisa tu correo."}