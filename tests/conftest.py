import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from src.parque_jurasico.main import app
from src.parque_jurasico.bd.BaseDatos import Base, get_db_session
from src.parque_jurasico.modelos.dinosaurio import Usuario
from src.parque_jurasico.security.seguridad import hashear_contrasena, crear_token_acceso

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def auth_headers(db_session):
    """
    Crea un usuario de prueba activo y devuelve un header de autorización Bearer válido.
    """
    password = "TestPassword123!"
    usuario = Usuario(
        username="test_auth_user@jurassic.com",
        nombre="Dr. Grant",
        apellidos="Alan",
        hashed_password=hashear_contrasena(password),
        role="visitante",
        is_active=True
    )
    db_session.add(usuario)
    await db_session.commit()

    access_token = crear_token_acceso(
        data={"sub": usuario.username, "role": usuario.role}
    )

    return {"Authorization": f"Bearer {access_token}"}