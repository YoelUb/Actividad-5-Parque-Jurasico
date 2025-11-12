import json
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from pathlib import Path
from ...security.seguridad import get_current_active_admin
from ...modelos.dinosaurio import Usuario

router = APIRouter()

CONFIG_FILE = Path("src/parque_jurasico/assets_config.json")


class AssetConfig(BaseModel):
    jeepColor: str
    carnivoreDino: str
    herbivoreDino: str
    aviaryDino: str
    aquaDino: str


def get_config_path():
    base_dir = Path(__file__).resolve().parent.parent.parent
    return base_dir / "assets_config.json"


@router.get("/config", response_model=AssetConfig)
async def get_asset_config():
    """
    Obtiene la configuración de assets guardada.
    Este endpoint es público para que el mapa (usuario) pueda leerlo.
    """
    config_path = get_config_path()
    if not config_path.exists():
        default_config = {
            "jeepColor": "Green", "carnivoreDino": "RedDino", "herbivoreDino": "BlueDino",
            "aviaryDino": "YellowDino", "aquaDino": "DarkGreenDino"
        }
        try:
            with open(config_path, "w") as f:
                json.dump(default_config, f, indent=4)
            return default_config
        except IOError as e:
            raise HTTPException(status_code=500, detail=f"No se pudo crear el archivo de configuración: {e}")

    try:
        with open(config_path, "r") as f:
            config = json.load(f)
        return config
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"No se pudo leer el archivo de configuración: {e}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error al decodificar el archivo de configuración.")


@router.put("/config", status_code=200)
async def update_asset_config(
    config: AssetConfig,
    admin: Usuario = Depends(get_current_active_admin)
):
    """
    Actualiza la configuración de assets. Requiere ser admin.
    """
    config_path = get_config_path()
    try:
        with open(config_path, "w") as f:
            json.dump(config.dict(), f, indent=4)
        return {"message": "Configuración de assets guardada con éxito"}
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"No se pudo escribir en el archivo de configuración: {e}")