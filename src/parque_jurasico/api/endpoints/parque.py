from fastapi import APIRouter, Depends, HTTPException
from ...security import seguridad
from ...modelos import dinosaurio as modelos
from ...bd import BaseDatos as db
from typing import List
from src.parque_jurasico.modelos.dinosaurio import Dinosaurio, Recinto
from src.parque_jurasico.bd.BaseDatos import (
    obtener_todos_los_dinosaurios,
    obtener_todos_los_recintos
)


router = APIRouter()

@router.get("/diseno", response_model=modelos.DisenoParque)
async def obtener_diseno_parque(usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual)):
    return db.DISENO_DEL_PARQUE

@router.get("/dinosaurio/{dino_id}", response_model=modelos.Dinosaurio)
async def obtener_dinosaurio(dino_id: str, usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual)):
    dino = db.DINOSAURIOS_DB.get(dino_id)
    if not dino:
        raise HTTPException(status_code=404, detail="Dinosaurio no encontrado")
    return dino


@router.get("/recintos", response_model=List[Recinto])
def get_todos_los_recintos():
    """
    Obtiene la lista de todos los recintos del parque.
    """
    return obtener_todos_los_recintos()

@router.get("/dinosaurios", response_model=List[Dinosaurio])
def get_todos_los_dinosaurios():
    """
    Obtiene la lista de todos los dinosaurios.
    """
    return obtener_todos_los_dinosaurios()

