from pydantic import BaseModel
from typing import Literal, List, Optional

TipoRecinto = Literal["terrestre", "acuatico", "aviario", "edificio", "paisaje"]

class Dinosaurio(BaseModel):
    id: str
    nombre: str
    era: str
    area: str
    dieta: str
    tipo_recinto: TipoRecinto

class Recinto(BaseModel):
    grid_id: str
    nombre: str
    tipo: TipoRecinto
    id_dinosaurio: Optional[str] = None

class DisenoParque(BaseModel):
    tamano_grid: List[int] = [3, 3]
    recintos: List[Recinto]

class Token(BaseModel):
    access_token: str
    token_type: str

class Usuario(BaseModel):
    username: str

class UsuarioAuth(Usuario):
    role: str