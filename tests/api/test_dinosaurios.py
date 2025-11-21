import pytest
from src.parque_jurasico.modelos.dinosaurio import Dinosaurio

ENDPOINT_DINOS = "/api/parque/dinosaurios"
ENDPOINT_DINO_DETALLE = "/api/parque/dinosaurio"


@pytest.mark.asyncio
async def test_obtener_dinosaurios_lista_vacia(client, auth_headers):
    """Debe devolver una lista vacía si no hay dinosaurios en la BD."""
    response = await client.get(ENDPOINT_DINOS, headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_obtener_dinosaurios_con_datos(client, db_session, auth_headers):
    """Debe devolver el dinosaurio insertado."""
    mi_id = "dino_test_01"

    dino_prueba = Dinosaurio(
        dino_id_str=mi_id,
        nombre="T-Rex Test",
        especie="Tyrannosaurus",
        dieta="Carnívoro",
        descripcion="Dino de prueba unitaria",
        sprite_base_path="/test/path"
    )
    db_session.add(dino_prueba)
    await db_session.commit()

    response = await client.get(ENDPOINT_DINOS, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    # Validamos que coincida con el ID que definimos arriba
    assert data[0]["dino_id_str"] == mi_id
    assert data[0]["nombre"] == "T-Rex Test"


@pytest.mark.asyncio
async def test_obtener_dinosaurio_detalle_exito(client, db_session, auth_headers):
    """Debe devolver el detalle de un dinosaurio existente."""
    test_id = "dino_test_detail"

    dino_prueba = Dinosaurio(
        dino_id_str=test_id,
        nombre="Velociraptor",
        especie="Raptor",
        dieta="Carnívoro",
        descripcion="Rápido",
        sprite_base_path="/raptor"
    )
    db_session.add(dino_prueba)
    await db_session.commit()

    response = await client.get(f"{ENDPOINT_DINO_DETALLE}/{test_id}", headers=auth_headers)

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["nombre"] == "Velociraptor"
    assert json_data["dino_id_str"] == test_id


@pytest.mark.asyncio
async def test_obtener_dinosaurio_no_existente(client, auth_headers):
    """Debe devolver 404 si el ID no existe."""
    response = await client.get(f"{ENDPOINT_DINO_DETALLE}/id_falso_123", headers=auth_headers)
    assert response.status_code == 404
    assert response.json()["detail"] == "Dinosaurio no encontrado"