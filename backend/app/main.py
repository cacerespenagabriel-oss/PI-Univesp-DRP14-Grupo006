from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, dashboard, frequencia, upload, reports

app = FastAPI(
    title="Frequência+ API",
    description="API para gestão de frequências e controle de ponto",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(frequencia.router)
app.include_router(upload.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "API Frequência+ rodando com sucesso!"}