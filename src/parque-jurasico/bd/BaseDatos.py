from typing import Dict, List
from passlib.context import CryptContext
from ..models.dinosaurio import Dinosaurio, Recinto, DisenoParque



contexto_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

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