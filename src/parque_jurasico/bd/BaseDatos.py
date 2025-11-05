from typing import Dict, List
from passlib.context import CryptContext
from src.parque_jurasico.models.dinosaurio import Dinosaurio, Recinto, DisenoParque

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

DINOSAURIOS_DB: Dict[str, Dinosaurio] = {
    "dino_001": Dinosaurio(
        id="dino_001",
        nombre="Tyrannosaurus Rex",
        era="Cretácico",
        area="Sector Norte",
        dieta="Carnívoro",
        tipo_recinto="terrestre"
    ),
    "dino_002": Dinosaurio(
        id="dino_002",
        nombre="Mosasaurus",
        era="Cretácico",
        area="La Laguna",
        dieta="Carnívoro",
        tipo_recinto="acuatico"
    ),
    "dino_003": Dinosaurio(
        id="dino_003",
        nombre="Pteranodon",
        era="Cretácico",
        area="El Domo",
        dieta="Piscívoro",
        tipo_recinto="aviario"
    ),
    "dino_004": Dinosaurio(
        id="dino_004",
        nombre="Triceratops",
        era="Cretácico",
        area="Pradera Este",
        dieta="Herbívoro",
        tipo_recinto="terrestre"
    ),
    "dino_005": Dinosaurio(
        id="dino_005",
        nombre="Brachiosaurus",
        era="Jurásico",
        area="Gran Valle",
        dieta="Herbívoro",
        tipo_recinto="terrestre"
    ),
    "dino_006": Dinosaurio(
        id="dino_006",
        nombre="Velociraptor",
        era="Cretácico",
        area="Sector de Contención",
        dieta="Carnívoro",
        tipo_recinto="terrestre"
    ),
}

RECINTOS_LIST: List[Recinto] = [
    Recinto(grid_id="a1", nombre="Recinto del T-Rex", tipo="terrestre", id_dinosaurio="dino_001"),
    Recinto(grid_id="a2", nombre="El Gran Valle", tipo="terrestre", id_dinosaurio="dino_005"),
    Recinto(grid_id="a3", nombre="Domo Aviario", tipo="aviario", id_dinosaurio="dino_003"),
    Recinto(grid_id="b1", nombre="Centro de Visitantes", tipo="edificio"),
    Recinto(grid_id="b2", nombre="Pradera de Triceratops", tipo="terrestre", id_dinosaurio="dino_004"),
    Recinto(grid_id="b3", nombre="Montaña", tipo="paisaje"),
    Recinto(grid_id="c1", nombre="Contención de Raptors", tipo="terrestre", id_dinosaurio="dino_006"),
    Recinto(grid_id="c2", nombre="La Laguna", tipo="acuatico", id_dinosaurio="dino_002"),
    Recinto(grid_id="c3", nombre="Bosque", tipo="paisaje"),
]

DISENO_DEL_PARQUE = DisenoParque(
    tamano_grid=[3, 3],
    recintos=RECINTOS_LIST
)

def crear_nuevo_dinosaurio(dino: Dinosaurio) -> Dinosaurio:
    if dino.id in DINOSAURIOS_DB:
        raise ValueError("El ID del dinosaurio ya existe")
    DINOSAURIOS_DB[dino.id] = dino
    return dino

def obtener_todos_los_dinosaurios() -> List[Dinosaurio]:
    return list(DINOSAURIOS_DB.values())

def obtener_todos_los_recintos() -> List[Recinto]:
    return DISENO_DEL_PARQUE.recintos