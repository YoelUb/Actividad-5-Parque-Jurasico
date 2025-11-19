import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from pathlib import Path
from ...security.seguridad import get_current_active_admin
from ...modelos.dinosaurio import Usuario

router = APIRouter()


class AssetConfig(BaseModel):
    """
    Define la estructura de datos para la configuración de activos del parque.
    """
    jeepColor: str
    carnivoreDino: str
    herbivoreDino: str
    aviaryDino: str
    aquaDino: str


def get_config_path() -> Path:
    """
    Calcula la ruta absoluta del archivo assets_config.json.
    Sube 4 niveles desde la ubicación del archivo actual para llegar a la raíz de la aplicación (asumiendo
    una estructura src/parque_jurasico/api/routers/assets_router.py).
    """
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    return base_dir / "assets_config.json"



@router.get("/config", response_model=AssetConfig)
async def get_asset_config():
    """
    Obtiene la configuración de assets guardada del archivo JSON.
    Si el archivo no existe o falla la lectura, devuelve la configuración por defecto.
    """
    config_path = get_config_path()

    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {
            "jeepColor": "Green",
            "carnivoreDino": "RedDino",
            "herbivoreDino": "triceratops",
            "aviaryDino": "volador",
            "aquaDino": "marino"
        }


@router.put("/config", status_code=200)
async def update_asset_config(
        config: AssetConfig,
        admin: Usuario = Depends(get_current_active_admin)
):
    """
    Actualiza la configuración de assets en el archivo JSON. Requiere autenticación de administrador.
    """
    config_path = get_config_path()


    try:
        with open(config_path, "w") as f:
            json.dump(config.dict(), f, indent=4)
        return {"message": "Configuración de assets guardada con éxito"}
    except IOError as e:
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo escribir en el archivo de configuración: {e}"
        )