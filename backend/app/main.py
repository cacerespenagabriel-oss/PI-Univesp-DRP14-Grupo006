from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.routers import alunos, auth, dashboard, frequencias, previsao, reports, upload

app = FastAPI(
    title="Frequência+ API",
    description="API de gestão de frequência de alunos, com previsão de presença por machine learning",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(frequencias.router)
app.include_router(alunos.router)
app.include_router(previsao.router)
app.include_router(upload.router)
app.include_router(reports.router)


@app.get("/")
def read_root():
    return {"message": "API Frequência+ rodando com sucesso!", "documentacao": "/docs"}
