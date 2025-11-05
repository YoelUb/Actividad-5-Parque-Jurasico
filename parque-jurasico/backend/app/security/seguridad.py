import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional
from app.modelos import Usuario


CLAVE_SECRETA = "clave_secreta_muy_segura_para_jurassic_park"
ALGORITMO = "HS256"
MINUTOS_EXPIRACION_TOKEN = 30

contexto_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


oauth2_esquema = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


usuarios_falsos_db = {
    "admin": {
        "username": "admin",
        "hashed_password": contexto_pwd.hash("admin123"),
        "role": "admin"
    },
    "visitante1": {
        "username": "visitante1",
        "hashed_password": contexto_pwd.hash("pass123"),
        "role": "visitante"
    }
}



def verificar_contrasena(contrasena_plana, contrasena_hasheada):
    """Comprueba si la contraseña plana coincide con el hash"""
    return contexto_pwd.verify(contrasena_plana, contrasena_hasheada)


def obtener_hash_contrasena(contrasena):
    """Genera un hash de la contraseña"""
    return contexto_pwd.hash(contrasena)


def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un nuevo token JWT"""
    a_codificar = data.copy()
    if expires_delta:
        expira = datetime.now(timezone.utc) + expires_delta
    else:
        expira = datetime.now(timezone.utc) + timedelta(minutes=15)

    a_codificar.update({"exp": expira})
    token_jwt_codificado = jwt.encode(a_codificar, CLAVE_SECRETA, algorithm=ALGORITMO)
    return token_jwt_codificado



async def obtener_usuario_actual(token: str = Depends(oauth2_esquema)) -> Usuario:
    """
    Dependencia de FastAPI: decodifica el token JWT, comprueba
    que el usuario exista y devuelve sus datos.
    """
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