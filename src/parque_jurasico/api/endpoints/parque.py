from fastapi import APIRouter, Depends, HTTPException
from ...security import seguridad
from ...modelos import dinosaurio as modelos
from ...bd.BaseDatos import get_db_session
from src.parque_jurasico.modelos.dinosaurio import Dinosaurio as DinosaurioTabla
from src.parque_jurasico.modelos.dinosaurio import Recinto as RecintoTabla
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
from pathlib import Path

router = APIRouter()


def get_config_path():
    base_dir = Path(__file__).resolve().parent.parent.parent
    return base_dir / "assets_config.json"


DINO_ASSET_MAP = {
    "RedDino": "/RedDino/RedDinosaur",
    "BlueDino": "/BlueDino/BlueDinosaur",
    "YellowDino": "/yellowDino/YellowDinosaur",
    "DarkGreenDino": "/DarkGreenDino/DarkGreenDinosaur",
    "liteGreenDino": "/liteGreenDino/LightGreenDinosaur",
}


@router.get("/dinosaurio/{dino_id_str}", response_model=modelos.DinosaurioSchema)
async def obtener_dinosaurio(
        dino_id_str: str,
        usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(
        select(DinosaurioTabla).where(DinosaurioTabla.dino_id_str == dino_id_str)
    )
    dino = result.scalars().first()

    if not dino:
        raise HTTPException(status_code=404, detail="Dinosaurio no encontrado")

    try:
        config_path = get_config_path()
        with open(config_path, "r") as f:
            config = json.load(f)

        asset_key = None
        if dino.dino_id_str == "dino_001":
            asset_key = config.get("carnivoreDino")
        elif dino.dino_id_str == "dino_004":
            asset_key = config.get("herbivoreDino")
        elif dino.dino_id_str == "dino_003":
            asset_key = config.get("aviaryDino")
        elif dino.dino_id_str == "dino_002":
            asset_key = config.get("aquaDino")

        if asset_key and asset_key in DINO_ASSET_MAP:
            dino.sprite_base_path = DINO_ASSET_MAP.get(asset_key, dino.sprite_base_path)

    except Exception:
        pass

    return dino


@router.get("/recintos", response_model=List[modelos.RecintoSchema])
async def get_todos_los_recintos(
        usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(RecintoTabla))
    recintos = result.scalars().all()
    return recintos


@router.get("/dinosaurios", response_model=List[modelos.DinosaurioSchema])
async def get_todos_los_dinosaurios(
        usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(select(DinosaurioTabla))
    dinos_db = result.scalars().all()

    try:
        config_path = get_config_path()
        with open(config_path, "r") as f:
            config = json.load(f)
    except Exception:
        return dinos_db

    dinos_actualizados = []
    for dino in dinos_db:
        asset_key = None
        if dino.dino_id_str == "dino_001":
            asset_key = config.get("carnivoreDino")
        elif dino.dino_id_str == "dino_004":
            asset_key = config.get("herbivoreDino")
        elif dino.dino_id_str == "dino_003":
            asset_key = config.get("aviaryDino")
        elif dino.dino_id_str == "dino_002":
            asset_key = config.get("aquaDino")

        if asset_key and asset_key in DINO_ASSET_MAP:
            dino.sprite_base_path = DINO_ASSET_MAP.get(asset_key, dino.sprite_base_path)

        dinos_actualizados.append(dino)

    return dinos_actualizados