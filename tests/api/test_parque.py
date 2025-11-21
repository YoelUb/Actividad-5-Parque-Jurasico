import pytest
from src.parque_jurasico.modelos.dinosaurio import Dinosaurio, Recinto

ENDPOINT_DINOS = "/api/parque/dinosaurios"
ENDPOINT_DINO_DETALLE = "/api/parque/dinosaurio"
ENDPOINT_RECINTOS = "/api/parque/recintos"


@pytest.mark.asyncio
async def test_obtener_dinosaurios_lista_vacia(client, auth_headers):
    """
    Verifica que el endpoint devuelve una lista vacía ([])
    cuando la base de datos no tiene registros.
    """
    response = await client.get(ENDPOINT_DINOS, headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_obtener_dinosaurios_con_datos(client, db_session, auth_headers):
    """
    Verifica que el endpoint devuelve correctamente los dinosaurios
    que existen en la base de datos, aplicando la configuración de assets.
    """
    dino = Dinosaurio(
        dino_id_str="dino_001",
        nombre="T-Rex Original",
        especie="Tyrannosaurus Rex",
        dieta="Carnívoro",
        descripcion="El rey de los dinosaurios.",
        sprite_base_path="/original/path"
    )
    db_session.add(dino)
    await db_session.commit()

    response = await client.get(ENDPOINT_DINOS, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()

    assert len(data) == 1
    assert data[0]["dino_id_str"] == "dino_001"


@pytest.mark.asyncio
async def test_obtener_detalle_dinosaurio_exito(client, db_session, auth_headers):
    """
    Prueba obtener un dinosaurio específico por su ID string.
    """
    dino = Dinosaurio(
        dino_id_str="dino_unico",
        nombre="Velociraptor",
        especie="Dromaeosauridae",
        dieta="Carnívoro",
        descripcion="Inteligente y letal",
        sprite_base_path="/raptor"
    )
    db_session.add(dino)
    await db_session.commit()

    response = await client.get(f"{ENDPOINT_DINO_DETALLE}/dino_unico", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["dino_id_str"] == "dino_unico"
    assert data["nombre"] == "Velociraptor"


@pytest.mark.asyncio
async def test_obtener_detalle_dinosaurio_404(client, auth_headers):
    """
    Prueba que la API devuelve un error 404 si el dinosaurio no existe.
    """
    response = await client.get(f"{ENDPOINT_DINO_DETALLE}/id_que_no_existe", headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Dinosaurio no encontrado"


@pytest.mark.asyncio
async def test_obtener_recintos(client, db_session, auth_headers):
    """
    Verifica que se pueden obtener los recintos del parque.
    """
    recinto = Recinto(
        nombre="Aviario",
        x=100,
        y=200,
        r=50,
        dino_id_str=None
    )
    db_session.add(recinto)
    await db_session.commit()

    response = await client.get(ENDPOINT_RECINTOS, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["nombre"] == "Aviario"
    assert data[0]["x"] == 100