from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from bd import BaseDatos as db
from security import seguridad
from models import dinosaurio as modelos



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


@router_auth.get("/me", response_model=modelos.Usuario)
async def leer_usuario_actual(usuario_actual: modelos.Usuario = Depends(seguridad.obtener_usuario_actual)):
    return usuario_actual



router_parque = APIRouter()


@router_parque.get("/diseno", response_model=modelos.DisenoParque)
async def obtener_diseno_parque(usuario_actual: models.Usuario = Depends(seguridad.obtener_usuario_actual)):
    return db.DISENO_DEL_PARQUE


@router_parque.get("/dinosaurio/{dino_id}", response_model=modelos.Dinosaurio)
async def obtener_dinosaurio(dino_id: str, usuario_actual: models.Usuario = Depends(seguridad.obtener_usuario_actual)):
    dino = db.DINOSAURIOS_DB.get(dino_id)
    if not dino:
        raise HTTPException(status_code=404, detail="Dinosaurio no encontrado")
    return dino
