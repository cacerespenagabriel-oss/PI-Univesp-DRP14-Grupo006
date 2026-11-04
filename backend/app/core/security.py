"""Token de acesso simples, assinado com HMAC (sem dependências extras)."""
import base64
import hashlib
import hmac
import json
import time

from fastapi import Header, HTTPException, status

from app.config import SECRET_KEY, TOKEN_HORAS


def _assinar(dados: bytes) -> str:
    return hmac.new(SECRET_KEY.encode(), dados, hashlib.sha256).hexdigest()


def gerar_token(email: str) -> str:
    conteudo = json.dumps({"email": email, "exp": int(time.time()) + TOKEN_HORAS * 3600}).encode()
    corpo = base64.urlsafe_b64encode(conteudo).decode()
    return f"{corpo}.{_assinar(corpo.encode())}"


def _erro() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token de autenticação inválido ou expirado.",
    )


def verificar_token(authorization: str = Header(default="")) -> str:
    """Dependência das rotas protegidas: exige o cabeçalho 'Authorization: Bearer <token>'."""
    if not authorization.startswith("Bearer "):
        raise _erro()
    token = authorization.removeprefix("Bearer ").strip()
    try:
        corpo, assinatura = token.split(".", 1)
        if not hmac.compare_digest(assinatura, _assinar(corpo.encode())):
            raise ValueError
        dados = json.loads(base64.urlsafe_b64decode(corpo.encode()))
        if dados["exp"] < time.time():
            raise ValueError
    except (ValueError, KeyError, json.JSONDecodeError):
        raise _erro() from None
    return dados["email"]
