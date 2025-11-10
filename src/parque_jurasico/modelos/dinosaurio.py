from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from src.parque_jurasico.bd.BaseDatos import Base
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
from typing import Optional

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="visitante")
    acepta_publicidad = Column(Boolean, default=False)
    is_active = Column(Boolean, default=False, nullable=False)
    must_change_password = Column(Boolean, default=False)

    verification_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    user = relationship("Usuario", back_populates="verification_tokens")

    def is_expired(self):
        return datetime.now(timezone.utc) > self.expires_at

class UsuarioAuth(BaseModel):
    username: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    must_change_password: bool

class UserCreate(BaseModel):
    username: EmailStr
    nombre: str
    apellidos: str
    password: str
    acepta_publicidad: bool = False

class Dinosaurio(BaseModel):
    id: Optional[str] = None
    nombre: str
    especie: str
    dieta: str

    class Config:
        orm_mode = True
        from_attributes = True


class Recinto(BaseModel):
    id: Optional[str] = None
    nombre: str
    zona: str
    estado: str
    nivel_peligro: int

    class Config:
        orm_mode = True
        from_attributes = True

class DisenoParque(BaseModel):
    zonas: list
    recintos: list

class HistorialEnviosPubli(Base):
    __tablename__ = "historial_envios_publi"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    admin_username = Column(String, nullable=False)
    destinatarios_count = Column(Integer, nullable=False)