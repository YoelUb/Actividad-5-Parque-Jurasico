from fastapi import APIRouter, Depends, HTTPException
from ...security import seguridad
from ...modelos import dinosaurio as modelos
from ...bd.BaseDatos import get_db_session
from src.parque_jurasico.modelos.dinosaurio import Dinosaurio as DinosaurioTabla
from src.parque_jurasico.modelos.dinosaurio import Recinto as RecintoTabla
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

router = APIRouter()

@router.get("/dinosaurio/{dino_id_str}", response_model=modelos.DinosaurioSchema)
async def obtener_dinosaurio(
        dino_id_str: str,
        usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)  # Inyecta la BBDD
):
    """
    Obtiene un dinosaurio específico por su dino_id_str desde la BBDD.
    """
    result = await db.execute(
        select(DinosaurioTabla).where(DinosaurioTabla.dino_id_str == dino_id_str)
    )
    dino = result.scalars().first()

    if not dino:
        raise HTTPException(status_code=404, detail="Dinosaurio no encontrado")
    return dino


@router.get("/recintos", response_model=List[modelos.RecintoSchema])
async def get_todos_los_recintos(
        usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)  # Inyecta la BBDD
):
    """
    Obtiene la lista de todos los recintos (puntos del mapa) desde la BBDD.
    """
    result = await db.execute(select(RecintoTabla))
    recintos = result.scalars().all()
    return recintos


@router.get("/dinosaurios", response_model=List[modelos.DinosaurioSchema])
async def get_todos_los_dinosaurios(
        usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)
):
    """
    Obtiene la lista de todos los dinosaurios desde la base de datos.
    """
    result = await db.execute(select(DinosaurioTabla))
    dinos = result.scalars().all()
    return dinos