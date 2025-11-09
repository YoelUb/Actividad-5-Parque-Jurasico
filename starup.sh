#!/bin/bash

echo "Ejecutando script de inicialización..."
python -m src.parque_jurasico.create_admin
echo "Iniciando Uvicorn..."
sh -c "uvicorn src.parque_jurasico.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir src"