from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard, upload

app = FastAPI(
    title="Frequência+ API",
    description="API para gestão de frequências e controle de ponto",
    version="0.1.0"
)

# Configuração de CORS para permitir que o React/Frontend acesse o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui as rotas
app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "API Frequência+ rodando com sucesso!"}