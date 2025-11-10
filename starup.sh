#!/bin/bash
set -e
echo "Ejecutando script de inicialización..."
python -m src.parque_jurasico.create_admin
echo "Script de inicialización completado."
echo "Iniciando Uvicorn..."
exec uvicorn src.parque_jurasico.main:app --host 0.0.0.0 --port 8000 --reload --reload-dir src
