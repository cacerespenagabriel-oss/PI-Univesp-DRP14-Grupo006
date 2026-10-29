from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/auth", tags=["Autenticação"])

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, password: str) -> str:
        if len(password) != 6 or not password.isdigit():
            raise ValueError("A senha deve conter exatamente 6 dígitos.")
        return password

@router.post("/login")
def login(data: LoginRequest):
    # Validação simples simulada
    if data.email == "admin@frequencia.com" and data.password == "123456":
        return {
            "token": "fake-jwt-token-123456789",
            "usuario": {
                "nome": "Administrador do Sistema",
                "email": data.email,
                "cargo": "Administrador"
            }
        }
    
    raise HTTPException(
        status_code=401, 
        detail="E-mail ou senha incorretos."
    )