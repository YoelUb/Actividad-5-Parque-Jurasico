from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from src.parque_jurasico.models import dinosaurio as modelos
from src.parque_jurasico.security import seguridad, auditing
from src.parque_jurasico.bd import BaseDatos as db

router_admin = APIRouter()

@router_admin.get("/logs", response_model=str)
async def get_logs(admin_user: models.UsuarioAuth = Depends(seguridad.get_current_active_admin)):
    auditing.log_admin_action(admin_user.username, "Consultó los logs de auditoría")
    return auditing.get_audit_logs()

@router_admin.get("/dinosaurios", response_model=List[modelos.Dinosaurio])
async def get_all_dinosaurios(admin_user: models.UsuarioAuth = Depends(seguridad.get_current_active_admin)):
    return db.obtener_todos_los_dinosaurios()

@router_admin.post("/dinosaurios", response_model=modelos.Dinosaurio)
async def create_dinosaurio(
    dino: models.Dinosaurio = Body(...),
    admin_user: models.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    try:
        nuevo_dino = db.crear_nuevo_dinosaurio(dino)
        auditing.log_admin_action(admin_user.username, f"Creó el dinosaurio: {nuevo_dino.nombre} (ID: {nuevo_dino.id})")
        return nuevo_dino
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router_admin.get("/recintos", response_model=List[modelos.Recinto])
async def get_all_recintos(admin_user: models.UsuarioAuth = Depends(seguridad.get_current_active_admin)):
    return db.obtener_todos_los_recintos()