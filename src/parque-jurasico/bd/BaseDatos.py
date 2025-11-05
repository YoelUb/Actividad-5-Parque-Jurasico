from typing import Dict
from app.modelos import Dinosaurio, Recinto, DisenoParque



DINOSAURIOS_DB: Dict[str, Dinosaurio] = {
    "1": Dinosaurio(id="1", nombre="Tyrannosaurus Rex", era="Cretácico Superior", area="Norteamérica", dieta="carnívoro", tipo_recinto="terrestre"),
    "2": Dinosaurio(id="2", nombre="Triceratops", era="Cretácico Superior", area="Norteamérica", dieta="herbívoro", tipo_recinto="terrestre"),
    "3": Dinosaurio(id="3", nombre="Velociraptor", era="Cretácico Superior", area="Mongolia", dieta="carnívoro", tipo_recinto="terrestre"),
    "4": Dinosaurio(id="4", nombre="Brachiosaurus", era="Jurásico Superior", area="Norteamérica", dieta="herbívoro", tipo_recinto="terrestre"),
    "5": Dinosaurio(id="5", nombre="Mosasaurus", era="Cretácico Superior", area="Océanos Globales", dieta="carnívoro", tipo_recinto="acuatico"),
    "6": Dinosaurio(id="6", nombre="Pteranodon", era="Cretácico Superior", area="Norteamérica", dieta="piscívoro", tipo_recinto="aviario")
}


DISENO_DEL_PARQUE = DisenoParque(
    recintos=[
        Recinto(grid_id="a1", nombre="La Pajarera", tipo="aviario", id_dinosaurio="6"),
        Recinto(grid_id="a2", nombre="Camino Norte", tipo="paisaje"),
        Recinto(grid_id="a3", nombre="Recinto T-Rex", tipo="terrestre", id_dinosaurio="1"),
        Recinto(grid_id="b1", nombre="Recinto Raptors", tipo="terrestre", id_dinosaurio="3"),
        Recinto(grid_id="b2", nombre="Centro de Visitantes", tipo="edificio"),
        Recinto(grid_id="b3", nombre="Valle Triceratops", tipo="terrestre", id_dinosaurio="2"),
        Recinto(grid_id="c1", nombre="Llanura Brachiosaurus", tipo="terrestre", id_dinosaurio="4"),
        Recinto(grid_id="c2", nombre="Camino Sur", tipo="paisaje"),
        Recinto(grid_id="c3", nombre="Laguna Mosasaurus", tipo="acuatico", id_dinosaurio="5"),
    ]
)