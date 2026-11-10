from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator

from app.config import ADMIN_EMAIL, ADMIN_SENHA
from app.core.security import gerar_token

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
    if data.email.strip().lower() == ADMIN_EMAIL.lower() and data.password == ADMIN_SENHA:
        return {
            "token": gerar_token(data.email),
            "usuario": {
                "nome": "Administrador do Sistema",
                "email": data.email,
                "cargo": "Administrador",
            },
        }

    raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
