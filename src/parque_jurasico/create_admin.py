import asyncio
import os
from sqlalchemy.future import select
from src.parque_jurasico.bd.BaseDatos import get_db_session, init_db
from src.parque_jurasico.modelos.dinosaurio import Usuario
from src.parque_jurasico.security.seguridad import hashear_contrasena


async def main():
    print("Iniciando script para crear admin...")

    await init_db()

    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!")

    async for session in get_db_session():
        try:
            stmt = select(Usuario).where(Usuario.username == admin_email)
            result = await session.execute(stmt)
            admin_existente = result.scalars().first()

            if not admin_existente:
                print(f"Creando usuario admin '{admin_email}'...")
                hashed_password = hashear_contrasena(admin_password)
                nuevo_admin = Usuario(
                    username=admin_email,
                    nombre="Admin",
                    apellidos="InGen",
                    hashed_password=hashed_password,
                    role="admin",
                    is_active=True,
                    must_change_password=True
                )
                session.add(nuevo_admin)
                await session.commit()
                print(f"¡Usuario admin '{admin_email}' creado exitosamente!")
            else:
                print(f"El usuario admin '{admin_email}' ya existe.")

            break
        except Exception as e:
            print(f"Error durante la creación del admin: {e}")
            await session.rollback()
        finally:
            await session.close()


if __name__ == "__main__":
    asyncio.run(main())