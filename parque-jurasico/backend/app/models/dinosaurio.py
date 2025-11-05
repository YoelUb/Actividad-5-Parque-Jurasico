from pydantic import BaseModel
from typing import Literal, List, Optional

TipoRecinto = Literal["terrestre", "acuatico", "aviario", "edificio", "paisaje"]

class Dinosaurio(BaseModel):
    """
    Define la estructura de un dinosaurio,
    basado en la API de Deno.
    """
    id: str
    nombre: str
    era: str
    area: str
    dieta: str
    tipo_recinto: TipoRecinto

class Recinto(BaseModel):
    """
    Define una casilla en la cuadrícula de nuestro parque.
    Puede contener un dinosaurio (por su ID) o ser un edificio/paisaje.
    """
    grid_id: str
    nombre: str
    tipo: TipoRecinto
    id_dinosaurio: Optional[str] = None

class DisenoParque(BaseModel):
    """Define la estructura completa del parque"""
    tamano_grid: List[int] = [3, 3]
    recintos: List[Recinto]

class Token(BaseModel):
    access_token: str
    token_type: str

class Usuario(BaseModel):
    username: str