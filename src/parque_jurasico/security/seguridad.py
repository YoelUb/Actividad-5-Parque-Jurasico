from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..bd.BaseDatos import get_db_session
from ..modelos.dinosaurio import Usuario, Token, UsuarioAuth
import re
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "una_clave_secreta_por_defecto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def hashear_contrasena(password: str) -> str:
    return pwd_context.hash(password)


def verificar_contrasena(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def validar_contrasena_rex(password: str) -> bool:
    if len(password) < 8:
        return False
    if not re.search(r"[A-Z]", password):
        return False
    if not re.search(r"[a-z]", password):
        return False
    if not re.search(r"\d", password):
        return False
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False
    return True


def crear_token_acceso(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def obtener_usuario_desde_token(db: AsyncSession, token: str, credentials_exception: HTTPException) -> Usuario:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
    except (JWTError, ValidationError):
        raise credentials_exception

    result = await db.execute(select(Usuario).where(Usuario.username == username))
    usuario = result.scalars().first()

    if usuario is None:
        raise credentials_exception
    if usuario.role != role:
        raise credentials_exception

    return usuario


async def obtener_usuario_actual(
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db_session)
) -> UsuarioAuth:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    usuario = await obtener_usuario_desde_token(db, token, credentials_exception)

    if not usuario.is_active:
        raise HTTPException(status_code=403, detail="Usuario inactivo")
    if usuario.must_change_password:
        raise HTTPException(status_code=403, detail="Debe cambiar la contraseña")

    return UsuarioAuth(username=usuario.username, role=usuario.role)


async def get_current_active_admin(
        current_user: UsuarioAuth = Depends(obtener_usuario_actual)
) -> UsuarioAuth:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operación no permitida: requiere privilegios de administrador"
        )
    return current_user


async def get_current_user_force_change(
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db_session)
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales (force-change)",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(Usuario).where(Usuario.username == username))
    user = result.scalars().first()

    if user is None:
        raise credentials_exception

    return user