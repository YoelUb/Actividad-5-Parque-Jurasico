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
        "descripcion": "El Tyrannosaurus Rex, con su distintiva coloración roja, es la atracción principal.",
        "animations": {'idle': [1, 9], 'walk': [10, 18]}
    },
    "BlueDino": {
        "nombre": "T-Rex (Azul)",
        "sprite_base_path": "/BlueDino/BlueDinosaur",
        "descripcion": "Una variante genética de T-Rex, resultado de la experimentación. Su color azul lo hace único.",
        "animations": {'idle': [1, 9], 'walk': [10, 18]}
    },
    "YellowDino": {
        "nombre": "T-Rex (Amarillo)",
        "sprite_base_path": "/yellowDino/YellowDinosaur",
        "descripcion": "Adaptado para camuflaje en zonas más áridas, esta variante amarilla es igual de imponente.",
        "animations": {'idle': [1, 9], 'walk': [10, 18]}
    },
    "DarkGreenDino": {
        "nombre": "T-Rex (Verde Oscuro)",
        "sprite_base_path": "/DarkGreenDino/DarkGreenDinosaur",
        "descripcion": "Una variante adaptada al camuflaje de jungla densa. Más difícil de ver, pero igual de letal.",
        "animations": {'idle': [1, 9], 'walk': [10, 18]}
    },
    "liteGreenDino": {
        "nombre": "T-Rex (Verde claro)",
        "sprite_base_path": "/liteGreenDino/LightGreenDinosaur",
        "descripcion": "Una mutación más joven y ágil, su coloración clara le permite cazar en praderas abiertas.",
        "animations": {'idle': [1, 9], 'walk': [10, 18]}
    },
    "Dino_Especial": {
        "nombre": "Spinosaurus",
        "sprite_base_path": "/Dino_Especial",
        "descripcion": "Un temible depredador semi-acuático con animaciones 'idle' y 'walk'.",
        "animations": {"idle": [1, 8, "/idle/Spino"], "walk": [9, 12, "/walk/Spino"]}
    },
    "triceratops": {
        "nombre": "Triceratops",
        "sprite_base_path": "/triceraptors/triceraptors",
        "descripcion": "Un robusto herbívoro conocido por sus tres cuernos y su gran gola ósea. Prefiere las llanuras.",
        "animations": {"idle": [1, 4], "walk": [1, 4]}
    },
    "broncosaurio_azul": {
        "nombre": "Brontosaurus (Azul)",
        "sprite_base_path": "/broncosaurio_azul",
        "descripcion": "Un gentil gigante de cuello largo con una distintiva coloración azulada.",
        "animations": {"idle": [1, 12, "/idle/broncosaurio"], "walk": [1, 13, "/walk/broncosaurio"]}
    },
    "volador": {
        "nombre": "Pteranodon",
        "sprite_base_path": "/volador/volador",
        "descripcion": "Un reptil volador que domina los cielos del aviario.",
        "animations": {"idle": [1, 12], "walk": [1, 12]}
    },
    "marino": {
        "nombre": "Mosasaurus",
        "sprite_base_path": "/marino/marino",
        "descripcion": "Un reptil marino colosal, el terror del acuario.",
        "animations": {"idle": [1, 2], "walk": [1, 2]}
    }
}


async def _get_asset_config():
    try:
        config_path = get_config_path()
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception:
        return {
            "jeepColor": "Green",
            "carnivoreDino": "RedDino",
            "herbivoreDino": "triceratops",
            "herbivoreDinoSecundario": "broncosaurio_azul",
            "aviaryDino": "volador",
            "aquaDino": "marino"
        }


def _apply_asset_override(dino, config):
    if not config:
        return dino

    dino_type_map = {
        "dino_001": ("carnivoreDino", "Carnívoro"),
        "dino_002": ("aquaDino", "Piscívoro"),
        "dino_003": ("aviaryDino", "Carnívoro"),
        "dino_004": ("herbivoreDino", "Herbívoro")
    }

    config_key, dieta_base = dino_type_map.get(dino.dino_id_str, (None, None))
    asset_key = config.get(config_key) if config_key else None

    if dino.dino_id_str == "dino_004" and config.get("herbivoreDinoSecundario"):
        asset_key = config.get("herbivoreDinoSecundario")

    variant_data = ASSET_DATA_MAP.get(asset_key) if asset_key else None

    if variant_data:
        dino.nombre = variant_data.get("nombre", dino.nombre)
        dino.descripcion = variant_data.get("descripcion", dino.descripcion)
        dino.sprite_base_path = variant_data.get("sprite_base_path", dino.sprite_base_path)
        dino.animations = variant_data.get("animations", dino.animations)

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