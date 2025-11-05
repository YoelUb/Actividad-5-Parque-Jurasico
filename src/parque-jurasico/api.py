from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app import base_de_datos, seguridad, modelos
from pip._internal import models

router_auth = APIRouter()


@router_auth.post("/token", response_model=modelos.Token)
async def login_para_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Endpoint para iniciar sesión. Recibe usuario y contraseña.
    Devuelve un token JWT.
    """
    usuario = base_de_datos.usuarios_falsos_db.get(form_data.username)
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


@router_auth.get("/me", response_model=modelos.Usuario)
async def leer_usuario_actual(usuario_actual: modelos.Usuario = Depends(seguridad.obtener_usuario_actual)):
    """
    Endpoint protegido que devuelve el usuario basado en el token.
    """
    return usuario_actual


router_parque = APIRouter()


@router_parque.get("/diseno", response_model=modelos.DisenoParque)
async def obtener_diseno_parque(usuario_actual: models.Usuario = Depends(seguridad.obtener_usuario_actual)):
    """
    Ruta protegida que devuelve la estructura 3x3 del parque.
    """
    return base_de_datos.DISENO_DEL_PARQUE


@router_parque.get("/dinosaurio/{dino_id}", response_model=modelos.Dinosaurio)
async def obtener_dinosaurio(dino_id: str, usuario_actual: models.Usuario = Depends(seguridad.obtener_usuario_actual)):
    """
    Ruta protegida que devuelve un dinosaurio específico por su ID.
    """
    dino = base_de_datos.DINOSAURIOS_DB.get(dino_id)
    if not dino:
        raise HTTPException(status_code=404, detail="Dinosaurio no encontrado")
    return dino