import json
from fastapi import APIRouter, Depends, HTTPException, Body
from pydantic import BaseModel
from pathlib import Path
from ...security.seguridad import get_current_active_admin
from ...modelos.dinosaurio import Usuario

router = APIRouter()


class AssetConfig(BaseModel):
    """Modelo Pydantic actualizado. 'herbivoreDinoSecundario' eliminado."""
    jeepColor: str
    carnivoreDino: str
    herbivoreDino: str
    aviaryDino: str
    aquaDino: str


def get_config_path():
    """Obtiene la ruta al archivo de configuración en la raíz de 'src'"""
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    return base_dir / "assets_config.json"


@router.get("/config", response_model=AssetConfig)
async def get_asset_config():
    """
    Obtiene la configuración de assets guardada.
    MODIFICADO PARA DEBUG: Devuelve siempre el objeto por defecto
    para evitar problemas de I/O con Docker en Mac.
    """
    print("--- DEBUG: Se está llamando a /api/assets/config ---")

    default_config = {
        "jeepColor": "Green",
        "carnivoreDino": "RedDino",
        "herbivoreDino": "triceratops",
        "aviaryDino": "volador",
        "aquaDino": "marino"
    }

    print(f"--- DEBUG: Devolviendo config: {default_config} ---")
    return default_config


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