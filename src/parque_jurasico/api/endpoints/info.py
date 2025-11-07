from fastapi import APIRouter

router = APIRouter()


RECINTO_DATA = {
    "trex": {"nombre": "Tyrannosaurus Rex", "zona": "Sector B", "estado": "Activo", "nivel_peligro": 10},
    "raptor": {"nombre": "Velociraptor", "zona": "Sector D", "estado": "Confinado", "nivel_peligro": 9},
    "brachiosaurus": {"nombre": "Brachiosaurus", "zona": "Pradera Norte", "estado": "Estable", "nivel_peligro": 2},
}

@router.get("/info/{recinto_id}")
async def get_info(recinto_id: str):
    """
    Obtiene información pública de un recinto específico.
    Esto será consumido por los "hotspots" de React.
    """
    return RECINTO_DATA.get(recinto_id, {"error": "Recinto no encontrado"})