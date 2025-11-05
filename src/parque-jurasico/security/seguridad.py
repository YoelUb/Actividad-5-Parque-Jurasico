import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional, Dict, Any
from ..models.dinosaurio import Usuario, UsuarioAuth
from ..bd.BaseDatos import usuarios_falsos_db, contexto_pwd

CLAVE_SECRETA = os.getenv("SECRET_KEY", "una_clave_secreta_por_defecto_muy_segura")
ALGORITMO = "HS256"
MINUTOS_EXPIRACION_TOKEN = 30

oauth2_esquema = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def crear_token_acceso(data: Dict[str, Any], expires_delta: Optional[timedelta] = None):
    a_codificar = data.copy()
    if expires_delta:
        expira = datetime.now(timezone.utc) + expires_delta
    else:
        expira = datetime.now(timezone.utc) + timedelta(minutes=15)
    a_codificar.update({"exp": expira})
    token_jwt_codificado = jwt.encode(a_codificar, CLAVE_SECRETA, algorithm=ALGORITMO)
    return token_jwt_codificado

def verificar_contrasena(contrasena_plana, contrasena_hasheada):
    return contexto_pwd.verify(contrasena_plana, contrasena_hasheada)

def obtener_usuario_desde_token(token: str) -> UsuarioAuth:
    excepcion_credenciales = HTTPException(
        status_code=401,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, CLAVE_SECRETA, algorithms=[ALGORITMO])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise excepcion_credenciales
    except JWTError:
        raise excepcion_credenciales

    usuario_db = usuarios_falsos_db.get(username)
    if usuario_db is None or usuario_db["role"] != role:
        raise excepcion_credenciales

    return UsuarioAuth(username=usuario_db["username"], role=usuario_db["role"])

async def obtener_usuario_actual(token: str = Depends(oauth2_esquema)) -> UsuarioAuth:
    return obtener_usuario_desde_token(token)

async def get_current_active_admin(current_user: UsuarioAuth = Depends(obtener_usuario_actual)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    return current_user