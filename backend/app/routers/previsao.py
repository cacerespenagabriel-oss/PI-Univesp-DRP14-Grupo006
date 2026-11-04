from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import verificar_token
from app.db.session import get_db
from app.ml.modelo import obter_modelo, prever_proxima_semana

router = APIRouter(prefix="/previsao", tags=["Machine Learning"], dependencies=[Depends(verificar_token)])


@router.get("")
def previsao_proxima_semana(db: Session = Depends(get_db)):
    """Previsão de presença para os 7 dias seguintes ao último dia com dados."""
    try:
        return prever_proxima_semana(db)
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro)) from erro


@router.get("/metricas")
def metricas_do_modelo(db: Session = Depends(get_db)):
    """Qualidade do modelo medida em 25% dos dados separados para teste."""
    try:
        return obter_modelo(db).metricas
    except ValueError as erro:
        raise HTTPException(status_code=422, detail=str(erro)) from erro
