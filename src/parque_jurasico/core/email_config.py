from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from src.parque_jurasico.bd.BaseDatos import get_db_session
from src.parque_jurasico.security import seguridad
from src.parque_jurasico.modelos import dinosaurio as modelos
from src.parque_jurasico.modelos.dinosaurio import Usuario, Dinosaurio as DinosaurioTabla, Recinto as RecintoTabla, HistorialEnviosPubli, \
    UserReadSchema, HistorialEnviosPubliSchema
from src.parque_jurasico.core import email_config
import logging
from datetime import datetime, timedelta, timezone
import random

router = APIRouter()
logger = logging.getLogger(__name__)

CUERPO_EXPEDICION = """
🦖🌴 *¡ALERTA DE EXPEDICIÓN!* 🌴🦕

*Estimado/a Explorador/a,*

Nuestros equipos de investigación han hecho un descubrimiento extraordinario en la Tienda Oficial de Jurassic Park. 
Se han desenterrado NUEVAS y ESPECTACULARES reliquias que ningún amante de los dinosaurios querrá perderse.

*🎁 TESOROS DESCUBIERTOS:*
• 🦖 Peluches de T-Rex Ultra Realistas
• 🥚 Huevos de Dinosaurio con Sorpresa
• 🧪 Kits de Paleontólogo Junior
• 🏺 Réplicas de Fósiles Exclusivas
• 👕 Ropa de Expedición Oficial

*📍 UBICACIÓN:* Tienda Regalos Jurassic Park
*⏰ TIEMPO LIMITADO:* Algunas especies pueden extinguirse pronto...

*¡No dejes que estas maravillas prehistóricas se extingan!*
Visita nuestra tienda hoy y lleva a casa un pedazo de historia.

*🌋 "Revive la magia, vive la aventura"* 🌋

*El Equipo de Jurassic Park*
*Donde la prehistoria cobra vida*
"""

CUERPO_CIENTIFICO = """
🔬 *COMUNICADO OFICIAL - DEPARTAMENTO DE PALEONTOLOGÍA* 🔬

*PARA: Todos los miembros registrados de Jurassic Park*
*DE: Dr. Alan Grant - Departamento de Exhibiciones*

*ASUNTO: Nuevos Especímenes Disponibles*

Estimados visitantes,

Es con gran entusiasmo que anunciamos la llegada de NUEVOS ESPECÍMENES a nuestra Tienda de Regalos. 
Estos artículos han sido meticulosamente seleccionados por nuestro equipo científico.

*📦 NUEVAS ADQUISICIONES:*
┌─────────────────────────────────────┐
│ 🦕 T-Rex Premium Collection         │
│ 🦖 Triceratops Sound Edition        │
│ 🥚 Dino Eggs Mystery Pack           │
│ 🔍 Fossil Digging Kit Pro           │
│ 🎒 Expedition Backpack Deluxe       │
└─────────────────────────────────────┘

*⚠️ ADVERTENCIA:* Estos artículos pueden causar:
• Fascinación extrema
• Coleccionismo compulsivo
• Diversión familiar garantizada

*🏃‍♂️ ¡Corre antes que se extingan!*
Nuestro stock es limitado como las especies que representamos.

*Jurassic Park - Más de 65 millones de años de emoción*
"""

CUERPO_AVENTURA = """
🌄 *¡AVENTURA EN EL HORIZONTE!* 🌄

*Querido/a Aventurero/a,*

Las puertas de Jurassic Park se abren para revelar tesoros nunca antes vistos. 
Prepárate para embarcarte en una misión de compras prehistórica como ninguna otra.

*🗺️ MAPA DEL TESORO:*
╔══════════════════════════════════╗
║            NUEVOS HALLAZGOS      ║
╠══════════════════════════════════╣
║ • 🦖 T-Rex Royale Edition        ║
║ • 🦕 Brachiosaurus Gigante       ║
║ • 🦖 Velociraptor Pack           ║
║ • 🥚 Dino Egg Collection         ║
║ • 🎨 Jurassic Art Set            ║
╚══════════════════════════════════╝

*🚨 ALERTA DE AVENTURA:*
Nuestros exploradores reportan que estos artículos están causando revuelo entre 
visitantes de todas las edades. ¡No te quedes fuera de esta expedición!

*⚡ Actúa rápido - La aventura espera*
Visita nuestra tienda y descubre por qué dicen:
"¡Es más emocionante que encontrar un fósil real!"

*🐾 Jurassic Park - Donde los sueños prehistóricos se hacen realidad* 🐾
"""

CUERPO_COMUNICACION = """
🏞️ *JURASSIC PARK - COMUNICACIÓN INTERNA* 🏞️

*DE: Administración del Parque*
*PARA: Nuestros Valiosos Visitantes*

*TEMA: Expansión de la Tienda de Regalos*

Nos complace anunciar que nuestra Tienda de Regalos ha sido actualizada con 
nuevas y emocionantes adiciones que capturan la esencia de Jurassic Park.

*🛍️ NUEVAS ADQUISICIONES DISPONIBLES:*

┌─ 🦖 COLECCIÓN CARNÍVOROS ────┐
│ • T-Rex Emperor Edition      │
│ • Raptor Squad Set           │
│ • Spinosaurus Premium        │
└─────────────────────────────┘

┌─ 🦕 COLECCIÓN HERBÍVOROS ───┐
│ • Brachiosaurus Family       │
│ • Triceratops Trio           │
│ • Stegosaurus Complete       │
└─────────────────────────────┘

┌─ 🎯 COLECCIÓN AVENTURA ─────┐
│ • Explorer Kit Pro           │
│ • Dino Tracker               │
│ • Fossil Replica Set         │
└─────────────────────────────┘

*📞 RESERVA TU VISITA:* No esperes más para experimentar estas maravillas.

*"Una experiencia que trascenderá el tiempo"*
*El equipo de Jurassic Park*
"""

CUERPO_CORTO = """
🦕 *¡NOTICIA PREHISTÓRICA!* 🦖

*Nuevos habitantes han llegado a nuestra tienda:*

• T-Rex Edition Especial
• Dino Huevos Sorpresa  
• Kit Paleontólogo Pro
• Colección Completa Herbívoros

*🏃‍♂️ ¡Ven antes de que desaparezcan!*

*Jurassic Park Store - Donde la aventura nunca se extingue* 🌋
"""

cuerpos_email = [
    CUERPO_EXPEDICION,
    CUERPO_CIENTIFICO,
    CUERPO_AVENTURA,
    CUERPO_COMUNICACION,
    CUERPO_CORTO
]


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
    query_last = select(HistorialEnviosPubli).order_by(HistorialEnviosPubli.timestamp.desc()).limit(1)
    result_last = await db.execute(query_last)
    last_log = result_last.scalars().first()

    if last_log:
        now = datetime.now(timezone.utc)
        last_time = last_log.timestamp

        if last_time.tzinfo is None:
            last_time = last_time.replace(tzinfo=timezone.utc)

        tiempo_transcurrido = now - last_time

        if tiempo_transcurrido < timedelta(weeks=1):
            tiempo_restante = timedelta(weeks=1) - tiempo_transcurrido
            dias = tiempo_restante.days
            horas = tiempo_restante.seconds // 3600
            minutos = (tiempo_restante.seconds % 3600) // 60

            raise HTTPException(
                status_code=400,
                detail=f"Solo se permite un envío semanal de marketing. Debes esperar {dias} días, {horas} horas y {minutos} minutos."
            )

    query = select(Usuario).where(Usuario.acepta_publicidad == True, Usuario.is_active == True)
    result = await db.execute(query)
    usuarios_con_publicidad = result.scalars().all()

    destinatarios = [user.username for user in usuarios_con_publicidad]

    if not destinatarios:
        raise HTTPException(status_code=400, detail="No hay usuarios que acepten publicidad.")

    cuerpo_elegido = random.choice(cuerpos_email)

    background_tasks.add_task(
        email_config.enviar_correos_publicidad,
        destinatarios,
        "¡Nuevas ofertas en Jurassic Park!",
        cuerpo_elegido
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
