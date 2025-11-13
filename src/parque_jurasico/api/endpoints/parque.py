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
import copy

router = APIRouter()


def get_config_path():
    base_dir = Path(__file__).resolve().parent.parent.parent
    return base_dir / "assets_config.json"


ASSET_DATA_MAP = {
    "RedDino": {
        "nombre": "T-Rex (Rojo)",
        "sprite_base_path": "/RedDino/RedDinosaur",
        "descripcion": "El Tyrannosaurus Rex, con su distintiva coloración roja, es la atracción principal."
    },
    "BlueDino": {
        "nombre": "T-Rex (Azul)",
        "sprite_base_path": "/BlueDino/BlueDinosaur",
        "descripcion": "Una variante genética de T-Rex, resultado de la experimentación. Su color azul lo hace único."
    },
    "YellowDino": {
        "nombre": "T-Rex (Amarillo)",
        "sprite_base_path": "/yellowDino/YellowDinosaur",
        "descripcion": "Adaptado para camuflaje en zonas más áridas, esta variante amarilla es igual de imponente."
    },
    "DarkGreenDino": {
        "nombre": "T-Rex (Verde Oscuro)",
        "sprite_base_path": "/DarkGreenDino/DarkGreenDinosaur",
        "descripcion": "Una variante adaptada al camuflaje de jungla densa. Más difícil de ver, pero igual de letal."
    },
    "liteGreenDino": {
        "nombre": "T-Rex (Verde claro)",
        "sprite_base_path": "/liteGreenDino/LightGreenDinosaur",
        "descripcion": "Una mutación más joven y ágil, su coloración clara le permite cazar en praderas abiertas."
    },

    "RedDino_generic": {"sprite_base_path": "/RedDino/RedDinosaur"},
    "BlueDino_generic": {"sprite_base_path": "/BlueDino/BlueDinosaur"},
    "YellowDino_generic": {"sprite_base_path": "/yellowDino/YellowDinosaur"},
    "DarkGreenDino_generic": {"sprite_base_path": "/DarkGreenDino/DarkGreenDinosaur"},
    "liteGreenDino_generic": {"sprite_base_path": "/liteGreenDino/LightGreenDinosaur"}
}

GENERIC_ASSET_MAP = {
    "RedDino": "/RedDino/RedDinosaur",
    "BlueDino": "/BlueDino/BlueDinosaur",
    "YellowDino": "/yellowDino/YellowDinosaur",
    "DarkGreenDino": "/DarkGreenDino/DarkGreenDinosaur",
    "liteGreenDino": "/liteGreenDino/LightGreenDinosaur",
}


async def _get_asset_config():
    """Función helper para cargar la configuración de assets."""
    try:
        config_path = get_config_path()
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception:
        return None


def _apply_asset_override(dino, config):
    """Aplica los overrides de assets a una instancia de dinosaurio."""
    if not config:
        return dino

    if dino.dino_id_str == "dino_001":
        asset_key = config.get("carnivoreDino")
        variant_data = ASSET_DATA_MAP.get(asset_key)
        if variant_data:
            dino.nombre = variant_data.get("nombre", dino.nombre)
            dino.descripcion = variant_data.get("descripcion", dino.descripcion)
            dino.sprite_base_path = variant_data.get("sprite_base_path", dino.sprite_base_path)

    elif dino.dino_id_str == "dino_004":
        asset_key = config.get("herbivoreDino")
        sprite_path = GENERIC_ASSET_MAP.get(asset_key)
        if sprite_path:
            dino.sprite_base_path = sprite_path

    elif dino.dino_id_str == "dino_003":
        asset_key = config.get("aviaryDino")
        sprite_path = GENERIC_ASSET_MAP.get(asset_key)
        if sprite_path:
            dino.sprite_base_path = sprite_path

    elif dino.dino_id_str == "dino_002":
        asset_key = config.get("aquaDino")
        sprite_path = GENERIC_ASSET_MAP.get(asset_key)
        if sprite_path:
            dino.sprite_base_path = sprite_path

    return dino


@router.get("/dinosaurio/{dino_id_str}", response_model=modelos.DinosaurioSchema)
async def obtener_dinosaurio(
        dino_id_str: str,
        usuario_actual: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual),
        db: AsyncSession = Depends(get_db_session)
):
    result = await db.execute(
        select(DinosaurioTabla).where(DinosaurioTabla.dino_id_str == dino_id_str)
    )
    dino_db = result.scalars().first()

    if not dino_db:
        raise HTTPException(status_code=404, detail="Dinosaurio no encontrado")

    dino = copy.deepcopy(dino_db)

    config = await _get_asset_config()
    dino = _apply_asset_override(dino, config)

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

    config = await _get_asset_config()
    if not config:
        return dinos_db

    dinos_actualizados = [copy.deepcopy(dino) for dino in dinos_db]

    dinos_finales = [_apply_asset_override(dino, config) for dino in dinos_actualizados]

    return dinos_finales