import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from dotenv import load_dotenv
from src.parque_jurasico.modelos.dinosaurio import Base, Usuario, Dinosaurio, Recinto
from src.parque_jurasico.security.seguridad import hashear_contrasena

load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "postgres-db")
DB_NAME = os.getenv("DB_NAME", "parque_jurasico")
DB_PORT = os.getenv("DB_PORT", 5432)

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_async_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Base de datos inicializada y tablas creadas (o ya existentes).")
    except Exception as e:
        print(f"Error al inicializar la base de datos (se reintentará): {e}")
        await asyncio.sleep(2)
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("Conexión exitosa en el segundo intento.")
        except Exception as e_retry:
            print(f"Error fatal al inicializar la BBDD en el reintento: {e_retry}")
            raise


async def create_default_data():
    print("Iniciando creación de datos por defecto...")
    async with SessionLocal() as db:
        try:
            admin_username = os.getenv("ADMIN_USER", "administrador")
            admin_password = os.getenv("ADMIN_PASSWORD", "admin")

            result = await db.execute(select(Usuario).where(Usuario.username == admin_username))
            admin_existe = result.scalars().first()

            if not admin_existe:
                print("Creando usuario administrador por defecto...")
                hashed_pass = hashear_contrasena(admin_password)
                admin_user = Usuario(
                    username=admin_username,
                    nombre="Admin",
                    apellidos="Parque",
                    hashed_password=hashed_pass,
                    role="admin",
                    is_active=True,
                    must_change_password=True
                )
                db.add(admin_user)
                print("Usuario administrador creado.")
            else:
                print("El usuario administrador ya existe.")

            result_dino = await db.execute(select(Dinosaurio).where(Dinosaurio.dino_id_str == "dino_001"))
            dino_existe = result_dino.scalars().first()

            if not dino_existe:
                print("Creando dinosaurios por defecto...")

                dino_001 = Dinosaurio(
                    dino_id_str="dino_001",
                    nombre="T-Rex",
                    especie="Tyrannosaurus Rex",
                    dieta="Carnívoro",
                    descripcion="El rey de los lagartos tiranos.",
                    sprite_base_path="/RedDino/RedDinosaur",
                    animations={"idle": [1, 9], "walk": [10, 18]}
                )

                dino_002 = Dinosaurio(
                    dino_id_str="dino_002",
                    nombre="Mosasaurus",
                    especie="Mosasaurus",
                    dieta="Piscívoro",
                    descripcion="Un reptil marino colosal.",
                    sprite_base_path="/marino/marino",
                    animations={"idle": [1, 2], "walk": [1, 2]}
                )

                dino_003 = Dinosaurio(
                    dino_id_str="dino_003",
                    nombre="Pteranodon",
                    especie="Pteranodon",
                    dieta="Carnívoro",
                    descripcion="Un reptil volador.",
                    sprite_base_path="/volador/volador",
                    animations={"idle": [1, 12], "walk": [1, 12]}
                )

                dino_004 = Dinosaurio(
                    dino_id_str="dino_004",
                    nombre="Triceratops",
                    especie="Triceratops",
                    dieta="Herbívoro",
                    descripcion="Un herbívoro pacífico con tres cuernos.",
                    sprite_base_path="/triceraptors/triceraptors",
                    animations={"idle": [1, 4], "walk": [1, 4]}
                )

                db.add_all([dino_001, dino_002, dino_003, dino_004])
                print("Dinosaurios por defecto añadidos.")
            else:
                print("Los dinosaurios por defecto ya existen.")

            result_recinto = await db.execute(select(Recinto).where(Recinto.nombre == "Recinto Carnívoros"))
            recinto_existe = result_recinto.scalars().first()

            if not recinto_existe:
                print("Creando recintos por defecto...")

                recintos_default = [
                    Recinto(nombre="Recinto Carnívoros", x=236, y=290, r=8, dino_id_str="dino_001"),
                    Recinto(nombre="Recinto Herbívoros", x=334, y=374, r=8, dino_id_str="dino_004"),
                    Recinto(nombre="Recinto Aviario", x=500, y=438, r=8, dino_id_str="dino_003"),
                    Recinto(nombre="Recinto Acuario", x=862, y=159, r=8, dino_id_str="dino_002"),
                    Recinto(nombre="Puerta", x=857, y=620, r=8, dino_id_str=None),
                    Recinto(nombre="Coche", x=608, y=658, r=8, dino_id_str=None),
                    Recinto(nombre="Guardas", x=484, y=336, r=8, dino_id_str=None),
                    Recinto(nombre="Helipuerto", x=575, y=175, r=8, dino_id_str=None),
                ]

                db.add_all(recintos_default)
                print("Recintos por defecto añadidos.")
            else:
                print("Los recintos por defecto ya existen.")

            await db.commit()
            print("Datos por defecto guardados en la BBDD.")

        except Exception as e:
            await db.rollback()
            print(f"Error al crear datos por defecto: {e}")
        finally:
            await db.close()


async def main():
    print("Iniciando script de inicialización de BBDD...")
    await init_db()
    await create_default_data()
    print("Script de inicialización finalizado.")


if __name__ == "__main__":
    asyncio.run(main())