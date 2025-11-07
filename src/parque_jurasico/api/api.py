from fastapi import APIRouter
from src.parque_jurasico.api.endpoints import admin, auth, parque, info

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(parque.router, prefix="/parque", tags=["parque"])
api_router.include_router(info.router, prefix="/info", tags=["info"])