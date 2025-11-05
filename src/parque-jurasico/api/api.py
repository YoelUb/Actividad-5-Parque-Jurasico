from fastapi import APIRouter
from .endpoints import auth, parque, admin

router = APIRouter()

router.include_router(auth.router_auth, prefix="/auth", tags=["Autenticación"])
router.include_router(parque.router_parque, prefix="/v1/parque", tags=["Parque"])
router.include_router(admin.router_admin, prefix="/admin", tags=["Admin"])