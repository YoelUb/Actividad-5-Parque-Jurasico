from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.parque_jurasico.bd.BaseDatos import Base
from datetime import datetime, timedelta, timezone


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)  # Email
    nombre = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="visitante")
    acepta_publicidad = Column(Boolean, default=False)
    is_active = Column(Boolean, default=False, nullable=False)
    must_change_password = Column(Boolean, default=False)

    verification_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")


class EmailVerificationToken(Base):
    """
    Tabla para almacenar los tokens de verificación de email.
    """
    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    user = relationship("Usuario", back_populates="verification_tokens")

    def is_expired(self):
        return datetime.now(timezone.utc) > self.expires_at