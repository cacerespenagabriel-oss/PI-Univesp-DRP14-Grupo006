from fastapi import Header, HTTPException, status

# Simulação de verificação de token enviado no Header
def verificar_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer ") or authorization == "Bearer invalid":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação inválido ou ausente."
        )
    return authorization