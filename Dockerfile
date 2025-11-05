FROM python:3.12-slim

WORKDIR /app


COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY parque-jurasico/backend/app .

EXPOSE 8000