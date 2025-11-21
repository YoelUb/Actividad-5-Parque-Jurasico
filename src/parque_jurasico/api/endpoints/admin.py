from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ...bd.BaseDatos import get_db_session
from ...security import seguridad
from ...modelos import dinosaurio as modelos
from ...modelos.dinosaurio import Usuario, Dinosaurio as DinosaurioTabla, Recinto as RecintoTabla, HistorialEnviosPubli, \
    UserReadSchema, HistorialEnviosPubliSchema
from ...core import email_config
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/users/me", response_model=modelos.UsuarioAuth)
async def read_users_me(current_user: modelos.UsuarioAuth = Depends(seguridad.obtener_usuario_actual)):
    return current_user


@router.get("/users/", response_model=List[UserReadSchema])
async def read_users(
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    result = await db.execute(select(Usuario).offset(skip).limit(limit))
    users = result.scalars().all()
    return users


@router.put("/users/{user_id}/grant-admin")
async def grant_admin_privileges(
        user_id: int,
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.role = "admin"
    await db.commit()
    return {"message": f"Usuario {user.username} ahora es administrador."}


@router.put("/users/{user_id}/force-password-change")
async def force_password_change(
        user_id: int,
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.must_change_password = True
    await db.commit()
    return {"message": f"El usuario {user.username} deberá cambiar su contraseña en el próximo inicio de sesión."}


@router.post("/enviar-publicidad")
async def enviar_publicidad_a_todos(
        background_tasks: BackgroundTasks,
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    query = select(Usuario).where(Usuario.acepta_publicidad == True, Usuario.is_active == True)
    result = await db.execute(query)
    usuarios_con_publicidad = result.scalars().all()

    destinatarios = [user.username for user in usuarios_con_publicidad]

    if not destinatarios:
        raise HTTPException(status_code=400, detail="No hay usuarios que acepten publicidad.")

    background_tasks.add_task(
        email_config.enviar_correos_publicidad,
        destinatarios,
        "🦖 ¡Nuevas Ofertas en Jurassic Park!",
        email_config.create_promotional_email_template()

    )

    try:
        registro_auditoria = HistorialEnviosPubli(
            admin_username=current_user.username,
            destinatarios_count=len(destinatarios)
        )
        db.add(registro_auditoria)
        await db.commit()
    except Exception as e:
        logger.error(f"Error al guardar en auditoría: {e}")
        await db.rollback()

    return {"message": "Campaña de publicidad enviada en segundo plano.", "destinatarios_count": len(destinatarios)}


@router.get("/dinosaurios", response_model=List[modelos.DinosaurioSchema])
async def admin_get_todos_los_dinosaurios(
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    result = await db.execute(select(DinosaurioTabla))
    dinos = result.scalars().all()
    return dinos


@router.get("/recintos", response_model=List[modelos.RecintoSchema])
async def admin_get_todos_los_recintos(
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    result = await db.execute(select(RecintoTabla))
    recintos = result.scalars().all()
    return recintos


@router.put("/recintos/{recinto_id}/asignar_dino")
async def asignar_dino_a_recinto(
        recinto_id: int,
        dino_id_str: str,
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    recinto_result = await db.execute(select(RecintoTabla).where(RecintoTabla.id == recinto_id))
    recinto = recinto_result.scalars().first()
    if not recinto:
        raise HTTPException(status_code=404, detail="Recinto no encontrado")

    dino_result = await db.execute(select(DinosaurioTabla).where(DinosaurioTabla.dino_id_str == dino_id_str))
    dino = dino_result.scalars().first()
    if not dino:
        raise HTTPException(status_code=404, detail="Dinosaurio no encontrado")

    recinto.dino_id_str = dino_id_str
    await db.commit()

    return {"message": f"Dinosaurio {dino.nombre} asignado a {recinto.nombre}"}


@router.get("/logs/marketing", response_model=List[modelos.HistorialEnviosPubliSchema])
async def get_marketing_logs(
        db: AsyncSession = Depends(get_db_session),
        current_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    query = select(HistorialEnviosPubli).order_by(HistorialEnviosPubli.timestamp.desc()).limit(100)
    result = await db.execute(query)
    logs = result.scalars().all()
    return logs
