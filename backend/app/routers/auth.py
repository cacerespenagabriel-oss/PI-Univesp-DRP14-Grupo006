from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Autenticação"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    # Validação simples simulada
    if data.email == "admin@frequencia.com" and data.password == "123456":
        return {
            "token": "fake-jwt-token-123456789",
            "usuario": {
                "nome": "Gestor de RH",
                "email": data.email,
                "cargo": "Administrador"
            }
        }
    
    raise HTTPException(
        status_code=401, 
        detail="E-mail ou senha incorretos."
    )