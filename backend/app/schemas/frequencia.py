from pydantic import BaseModel
from typing import Optional, List

# Schema para os pontos do gráfico de linha
class ChartDataPoint(BaseModel):
    data: str        # Ex: "01/08"
    presentes: int
    ausentes: int

# Schema para um registro de frequência individual (Tabela)
class AttendanceRecord(BaseModel):
    id: int
    data: str
    colaborador: str
    status: str      # "Presente", "Ausente", "Atraso"
    horario: Optional[str] = None

# Schema para os cards de resumo (KPIs)
class DashboardSummary(BaseModel):
    total_colaboradores: int
    presentes: int
    percentual_presentes: float
    ausentes: int
    percentual_ausentes: float
    atrasos: int
    percentual_atrasos: float

# Schema completo da resposta da Dashboard
class DashboardData(BaseModel):
    resumo: DashboardSummary
    grafico: List[ChartDataPoint]
    ultimos_registros: List[AttendanceRecord]