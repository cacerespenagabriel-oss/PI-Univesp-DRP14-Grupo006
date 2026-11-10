from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.security import verificar_token
from app.db.session import get_db
from app.services.importacao import importar_registros, ler_planilha

router = APIRouter(prefix="/upload", tags=["Upload de planilha"], dependencies=[Depends(verificar_token)])

TAMANHO_MAXIMO = 10 * 1024 * 1024  # 10 MB


@router.post("")
async def upload_planilha(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Recebe um CSV/XLSX no mesmo formato do arquivo original e grava no banco.

    O modelo de machine learning é treinado de novo automaticamente na próxima previsão.
    """
    conteudo = await file.read()
    if len(conteudo) > TAMANHO_MAXIMO:
        raise HTTPException(status_code=413, detail="Arquivo maior que 10 MB.")

    try:
        registros = ler_planilha(conteudo, file.filename or "")
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro)) from erro

    resultado = importar_registros(db, registros)
    return {"mensagem": "Planilha importada com sucesso!", "arquivo": file.filename, **resultado}
