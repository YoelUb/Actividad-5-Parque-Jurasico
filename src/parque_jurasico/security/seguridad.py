import os
import re
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Optional, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.parque_jurasico.modelos.dinosaurio import UsuarioAuth
from src.parque_jurasico.bd.BaseDatos import get_db_session
from src.parque_jurasico.modelos.dinosaurio import Usuario as UsuarioDBModel

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

def hashear_contrasena(contrasena_plana: str) -> str:
    return contexto_pwd.hash(contrasena_plana)

# --- 2. NUEVA FUNCIÓN DE VALIDACIÓN REX ---
def validar_contrasena_rex(password: str) -> bool:
    """
    Valida la complejidad de la contraseña usando Regex (Fuerza T-Rex).
    Política: 8+ chars, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo.
    """
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*()]", password):
        return False
    return True
# -------------------------------------------

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[UsuarioDBModel]:
    """Obtiene un usuario de la BD por su username (email)."""
    result = await db.execute(
        select(UsuarioDBModel).where(UsuarioDBModel.username == username)
    )
    return result.scalars().first()

async def obtener_usuario_desde_token(
    token: str,
    db: AsyncSession = Depends(get_db_session)
) -> UsuarioAuth:
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

    usuario_db = await get_user_by_username(db, username=username)
    if usuario_db is None or usuario_db.role != role:
        raise excepcion_credenciales

    return UsuarioAuth(username=usuario_db.username, role=usuario_db.role)

async def obtener_usuario_actual(
    token: str = Depends(oauth2_esquema),
    db: AsyncSession = Depends(get_db_session)
) -> UsuarioAuth:
    return await obtener_usuario_desde_token(token, db)

async def get_current_active_admin(current_user: UsuarioAuth = Depends(obtener_usuario_actual)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="No tienes permisos de administrador")
    return current_user