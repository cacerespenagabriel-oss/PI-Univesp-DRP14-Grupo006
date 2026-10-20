from fastapi import APIRouter
from app.schemas.frequencia import DashboardData
from app.db.mock_data import MOCK_SUMMARY, MOCK_REGISTROS

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", response_model=DashboardData)
def get_dashboard_data():
    """Retorna os dados resumidos dos cards e os últimos registros de frequência."""
    return {
        "resumo": MOCK_SUMMARY,
        "ultimos_registros": MOCK_REGISTROS
    }