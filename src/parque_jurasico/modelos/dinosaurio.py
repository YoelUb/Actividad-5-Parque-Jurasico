from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func, Text, JSON
from sqlalchemy.orm import relationship, declarative_base
from src.parque_jurasico.bd.BaseDatos import Base
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List

class Dinosaurio(Base):
    __tablename__ = "dinosaurios"

    id = Column(Integer, primary_key=True, index=True)
    dino_id_str = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    especie = Column(String, nullable=False)
    dieta = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    sprite_base_path = Column(String, nullable=True)
    animations = Column(JSON, nullable=True)

class Recinto(Base):
    __tablename__ = "recintos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False, unique=True)
    x = Column(Integer, nullable=False)
    y = Column(Integer, nullable=False)
    r = Column(Integer, nullable=False, default=8)
    dino_id_str = Column(String, ForeignKey("dinosaurios.dino_id_str"), nullable=True)
    dinosaurio = relationship("Dinosaurio")

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

class HistorialEnviosPubli(Base):
    __tablename__ = "historial_envios_publi"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    admin_username = Column(String, nullable=False)
    destinatarios_count = Column(Integer, nullable=False)

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

class UserReadSchema(BaseModel):
    id: int
    username: EmailStr
    nombre: str
    apellidos: str
    role: str
    is_active: bool
    must_change_password: bool
    acepta_publicidad: bool

    class Config:
        from_attributes = True

class NewPassword(BaseModel):
    new_username: EmailStr
    new_password: str

class DinosaurioSchema(BaseModel):
    id: Optional[int] = None
    dino_id_str: str
    nombre: str
    especie: str
    dieta: str
    descripcion: Optional[str] = None
    sprite_base_path: Optional[str] = None
    animations: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class RecintoSchema(BaseModel):
    id: Optional[int] = None
    nombre: str
    x: int
    y: int
    r: int
    dino_id_str: Optional[str] = None

    class Config:
        from_attributes = True

class VerificationRequest(BaseModel):
    email: EmailStr
    code: str

    class Config:
        from_attributes = True

class DisenoParque(BaseModel):
    zonas: list
    recintos: List[RecintoSchema]


class HistorialEnviosPubliSchema(BaseModel):
    id: int
    timestamp: datetime
    admin_username: str
    destinatarios_count: int

    class Config:
        from_attributes = True