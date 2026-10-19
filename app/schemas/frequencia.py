from pydantic import BaseModel
from typing import Optional, List

# Schema para um registro de frequência individual (Tabela do Dashboard)
class AttendanceRecord(BaseModel):
    id: int
    data: str
    colaborador: str
    status: str  # Ex: "Presente", "Ausente", "Atraso"
    horario: Optional[str] = None

# Schema para os cards de resumo do Dashboard
class DashboardSummary(BaseModel):
    total_colaboradores: int
    presentes: int
    percentual_presentes: float
    ausentes: int
    percentual_ausentes: float
    atrasos: int
    percentual_atrasos: float

# Schema da resposta completa da Dashboard
class DashboardData(BaseModel):
    resumo: DashboardSummary
    ultimos_registros: List[AttendanceRecord]