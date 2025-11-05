from fastapi import APIRouter, Depends, HTTPException
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from src.parque_jurasico.bd import BaseDatos as db
from src.parque_jurasico.security import seguridad
from src.parque_jurasico.modelos import dinosaurio as modelos

router_auth = APIRouter()


@router_auth.post("/token", response_model=modelos.Token)
async def login_para_token(form_data: OAuth2PasswordRequestForm = Depends()):
    usuario = db.usuarios_falsos_db.get(form_data.username)
    if not usuario or not seguridad.verificar_contrasena(form_data.password, usuario["hashed_password"]):
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrecto",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires_delta = timedelta(minutes=seguridad.MINUTOS_EXPIRACION_TOKEN)

    access_token = seguridad.crear_token_acceso(
        data={"sub": usuario["username"], "role": usuario["role"]},
        expires_delta=expires_delta
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router_auth.get("/me", response_model=modelos.UsuarioAuth)
async def leer_usuario_actual(usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual)):
    return usuario_actual