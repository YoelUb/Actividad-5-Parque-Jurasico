# src/parque_jurasico/create_admin.py
import asyncio
import os
from sqlalchemy.future import select
from src.parque_jurasico.bd.BaseDatos import SessionLocal, engine, Base
from src.parque_jurasico.modelos.dinosaurio import Usuario
from src.parque_jurasico.security.seguridad import hashear_contrasena

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@parque.jp")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


async def create_admin_user():
    print("Iniciando script para crear admin...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        try:
            result = await db.execute(select(Usuario).filter(Usuario.username == ADMIN_EMAIL))
            existing_user = result.scalars().first()

            if existing_user:
                print(f"El usuario admin '{ADMIN_EMAIL}' ya existe.")
                return

            print(f"Creando usuario admin '{ADMIN_EMAIL}'...")
            hashed_password = hashear_contrasena(ADMIN_PASSWORD)

            admin_user = Usuario(
                username=ADMIN_EMAIL,
                nombre="Admin",
                apellidos="InGen",
                hashed_password=hashed_password,
                role="admin",
                acepta_publicidad=False,
                is_active=True,
                must_change_password=True
            )

            db.add(admin_user)
            await db.commit()
            print(f"¡Usuario admin '{ADMIN_EMAIL}' creado exitosamente!")

        except Exception as e:
            await db.rollback()
            print(f"Error al crear el admin: {e}")
        finally:
            await db.close()


async def main():
    await create_admin_user()
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())