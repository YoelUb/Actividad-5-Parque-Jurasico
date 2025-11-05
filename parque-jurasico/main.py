from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router_auth, router_parque

app = FastAPI(title="API de Jurassic Park")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_auth, prefix="/api/auth", tags=["Autenticación"])
app.include_router(router_parque, prefix="/api/v1/parque", tags=["Parque"])

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Jurassic Park"}