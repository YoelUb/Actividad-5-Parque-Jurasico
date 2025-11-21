import pytest
from src.parque_jurasico.modelos.dinosaurio import Usuario
from src.parque_jurasico.security.seguridad import hashear_contrasena

LOGIN_ENDPOINT = "/api/auth/token"
ME_ENDPOINT = "/api/auth/me"


@pytest.mark.asyncio
async def test_login_exitoso(client, db_session):
    """
    Prueba que un usuario puede loguearse y recibir un token JWT.
    """
    password_plana = "Test1234!"
    hashed = hashear_contrasena(password_plana)

    usuario = Usuario(
        username="test@parque.com",
        nombre="Tester",
        apellidos="Jurasico",
        hashed_password=hashed,
        role="admin",
        is_active=True
    )
    db_session.add(usuario)
    await db_session.commit()

    payload = {
        "username": "test@parque.com",
        "password": password_plana
    }

    response = await client.post(LOGIN_ENDPOINT, data=payload)

    # 3. Validar respuesta
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_credenciales_incorrectas(client, db_session):
    """
    Prueba que el login falla con contraseña incorrecta.
    """
    # Crear usuario
    usuario = Usuario(
        username="test@parque.com",
        nombre="Tester",
        apellidos="Jurasico",
        hashed_password=hashear_contrasena("Correcta123!"),
        is_active=True
    )
    db_session.add(usuario)
    await db_session.commit()

    payload = {
        "username": "test@parque.com",
        "password": "IncorrectaPassword"
    }

    response = await client.post(LOGIN_ENDPOINT, data=payload)
    assert response.status_code == 401  # Unauthorized


@pytest.mark.asyncio
async def test_obtener_usuario_actual_me(client, db_session):
    """
    Prueba el endpoint /me usando el token obtenido del login.
    """
    # 1. Setup Usuario
    password = "UserPass1!"
    usuario = Usuario(
        username="user@parque.com",
        nombre="Usuario",
        apellidos="Normal",
        hashed_password=hashear_contrasena(password),
        role="visitante",
        is_active=True
    )
    db_session.add(usuario)
    await db_session.commit()

    login_res = await client.post(LOGIN_ENDPOINT, data={
        "username": "user@parque.com",
        "password": password
    })
    token = login_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_response = await client.get(ME_ENDPOINT, headers=headers)

    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["username"] == "user@parque.com"
    assert me_data["role"] == "visitante"


@pytest.mark.asyncio
async def test_acceso_sin_token(client):
    """
    Verifica que un endpoint protegido rechaza peticiones sin token.
    """
    response = await client.get(ME_ENDPOINT)
    assert response.status_code == 401