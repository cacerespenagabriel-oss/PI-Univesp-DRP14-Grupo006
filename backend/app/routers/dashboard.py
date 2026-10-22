from fastapi import APIRouter, Query
from typing import Optional
from app.schemas.frequencia import DashboardData
from app.db.mock_data import MOCK_SUMMARY, MOCK_REGISTROS

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", response_model=DashboardData)
def get_dashboard_data(
    status: Optional[str] = Query(None, description="Filtrar por 'Presente' ou 'Ausente'"),
    busca: Optional[str] = Query(None, description="Buscar colaborador pelo nome"),
    limit: int = Query(10, ge=1, le=50, description="Quantidade máxima de registros retornados")
):
    registros_filtrados = MOCK_REGISTROS

    # Filtro por Status
    if status:
        registros_filtrados = [
            r for r in registros_filtrados if r["status"].lower() == status.lower()
        ]

    # Filtro por Busca textual
    if busca:
        registros_filtrados = [
            r for r in registros_filtrados if busca.lower() in r["colaborador"].lower()
        ]

    # Limite/Paginação simples
    registros_filtrados = registros_filtrados[:limit]

    return {
        "resumo": MOCK_SUMMARY,
        "ultimos_registros": registros_filtrados
    }