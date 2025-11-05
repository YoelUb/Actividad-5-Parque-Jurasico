from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.parque_jurasico.api.api import router as api_router

app = FastAPI(title="API de Jurassic Park")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Jurassic Park"}