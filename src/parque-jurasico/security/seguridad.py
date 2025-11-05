import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
from ..models.dinosaurio import Usuario
from ..bd.BaseDatos import usuarios_falsos_db, contexto_pwd

CLAVE_SECRETA = os.getenv("CLAVE_SECRETA")
ALGORITMO = "HS256"
MINUTOS_EXPIRACION_TOKEN = 30

oauth2_esquema = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def verificar_contrasena(contrasena_plana, contrasena_hasheada):
    return contexto_pwd.verify(contrasena_plana, contrasena_hasheada)


async def obtener_usuario_actual(token: str = Depends(oauth2_esquema)) -> Usuario:
    excepcion_credenciales = HTTPException(
        status_code=401,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, CLAVE_SECRETA, algorithms=[ALGORITMO])
        username: str = payload.get("sub")
        if username is None:
            raise excepcion_credenciales
    except JWTError:
        raise excepcion_credenciales

    usuario_db = usuarios_falsos_db.get(username)
    if usuario_db is None:
        raise excepcion_credenciales

    return Usuario(username=usuario_db["username"])