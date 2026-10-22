from fastapi import APIRouter, Depends
from fastapi.responses import Response
from app.core.security import verificar_token
import pandas as pd
from app.db.mock_data import MOCK_REGISTROS

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])

@router.get("/exportar", dependencies=[Depends(verificar_token)])
def exportar_relatorio():
    """Gera e faz o download de um arquivo CSV com os registros de frequência."""
    df = pd.DataFrame(MOCK_REGISTROS)
    
    # Converte o DataFrame para CSV em memória
    csv_data = df.to_csv(index=False, encoding="utf-8-sig")
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=relatorio_frequencia.csv"}
    )