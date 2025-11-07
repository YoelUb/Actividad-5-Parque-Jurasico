from fastapi import APIRouter, Depends, HTTPException
from ...security import seguridad
from ...modelos import dinosaurio as modelos
from ...bd import BaseDatos as db

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