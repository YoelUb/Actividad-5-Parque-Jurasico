from fastapi import APIRouter, Depends, HTTPException, Body, BackgroundTasks
from typing import List
from datetime import datetime, timedelta, timezone
from sqlalchemy.future import select
from sqlalchemy.sql import func
from sqlalchemy.ext.asyncio import AsyncSession
from src.parque_jurasico.modelos import dinosaurio as modelos
from src.parque_jurasico.modelos.dinosaurio import Usuario as UsuarioDBModel, HistorialEnviosPubli
from src.parque_jurasico.security import seguridad, auditing
from src.parque_jurasico.bd.BaseDatos import get_db_session
from src.parque_jurasico.core.email_config import fm
from fastapi_mail import MessageSchema

router = APIRouter()

# HTML para el correo promocional
EMAIL_PROMO_HTML = """
<html>
  <body style="font-family:Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
    <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:10px;">
      <h2 style="color:#2b6cb0;">🦕 Parque Jurásico UAX</h2>
      <p>Descubre la aventura jurásica educativa en la Universidad Alfonso X el Sabio (UAX).</p>
      <ul>
        <li>Exposición de dinosaurios a tamaño real</li>
        <li>Talleres de paleontología</li>
        <li>Actividades educativas para todas las edades</li>
      </ul>
      <p><strong>📍 Dirección:</strong> Avda. de la Universidad 1, Villanueva de la Cañada, Madrid</p>
      <a href="https://www.uax.com"
         style="display:inline-block; background:#2b6cb0; color:white; padding:10px 15px; 
                border-radius:5px; text-decoration:none;">Más información</a>
    </div>
  </body>
</html>
"""


@router.post("/enviar-publicidad", status_code=202)
async def enviar_correo_promocional(
        background_tasks: BackgroundTasks,
        admin_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin),
        db: AsyncSession = Depends(get_db_session)
):
    # 1. Comprobar la regla de 1 envío por semana
    stmt_ultimo_envio = select(HistorialEnviosPubli).order_by(HistorialEnviosPubli.timestamp.desc()).limit(1)
    result_ultimo_envio = await db.execute(stmt_ultimo_envio)
    ultimo_envio = result_ultimo_envio.scalars().first()

    if ultimo_envio:
        tiempo_desde_ultimo_envio = datetime.now(timezone.utc) - ultimo_envio.timestamp
        if tiempo_desde_ultimo_envio < timedelta(days=7):
            dias_restantes = 7 - tiempo_desde_ultimo_envio.days
            raise HTTPException(
                status_code=429,
                detail=f"Límite de envío alcanzado. Inténtalo de nuevo en {dias_restantes} día(s)."
            )

    stmt_usuarios = select(UsuarioDBModel).where(
        UsuarioDBModel.acepta_publicidad == True,
        UsuarioDBModel.is_active == True
    )
    result_usuarios = await db.execute(stmt_usuarios)
    usuarios_a_enviar = result_usuarios.scalars().all()

    if not usuarios_a_enviar:
        raise HTTPException(status_code=404, detail="No se encontraron usuarios que acepten publicidad.")

    recipients = [user.username for user in usuarios_a_enviar]

    message = MessageSchema(
        subject="¡Vive la aventura jurásica educativa en la UAX! 🦖",
        recipients=recipients,
        body=EMAIL_PROMO_HTML,
        subtype="html"
    )

    background_tasks.add_task(fm.send_message, message)

    nuevo_log_envio = HistorialEnviosPubli(
        admin_username=admin_user.username,
        destinatarios_count=len(recipients)
    )
    db.add(nuevo_log_envio)
    await db.commit()

    auditing.log_admin_action(admin_user.username, f"Envió correo promocional a {len(recipients)} usuarios.")

    return {"message": f"Correo promocional enviado a {len(recipients)} usuarios."}


@router.get("/logs", response_model=str)
async def get_logs(admin_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)):
    auditing.log_admin_action(admin_user.username, "Consultó los logs de auditoría")
    return auditing.get_audit_logs()


@router.get("/dinosaurios", response_model=List[modelos.Dinosaurio])
async def get_all_dinosaurios(admin_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)):
    return bd.obtener_todos_los_dinosaurios()


@router.post("/dinosaurios", response_model=modelos.Dinosaurio)
async def create_dinosaurio(
        dino: modelos.Dinosaurio = Body(...),
        admin_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)
):
    try:
        nuevo_dino = db.crear_nuevo_dinosaurio(dino)
        auditing.log_admin_action(admin_user.username, f"Creó el dinosaurio: {nuevo_dino.nombre} (ID: {nuevo_dino.id})")
        return nuevo_dino
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/recintos", response_model=List[modelos.Recinto])
async def get_all_recintos(admin_user: modelos.UsuarioAuth = Depends(seguridad.get_current_active_admin)):
    return db.obtener_todos_los_recintos()