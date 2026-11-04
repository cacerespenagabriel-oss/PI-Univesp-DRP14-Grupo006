from typing import List

from pydantic import BaseModel


class ChartDataPoint(BaseModel):
    """Um ponto do gráfico de linha (um dia)."""
    data: str            # dd/mm
    data_iso: str        # aaaa-mm-dd
    presentes: int
    ausentes: int


class DashboardSummary(BaseModel):
    """Cards de resumo (KPIs) do dia de referência."""
    data_referencia: str
    total_alunos: int
    presentes: int
    percentual_presentes: float
    ausentes: int
    percentual_ausentes: float
    media_presenca_periodo: float


class DashboardData(BaseModel):
    resumo: DashboardSummary
    grafico: List[ChartDataPoint]
    datas_disponiveis: List[str]


class AttendanceRecord(BaseModel):
    """Uma linha da tabela de registros."""
    id: int
    data: str
    dia_semana: str
    id_aluno: int
    aluno: str
    idade: int
    genero: str
    status: str          # "Presente" ou "Ausente"


class AttendancePage(BaseModel):
    itens: List[AttendanceRecord]
    total: int
    pagina: int
    tamanho_pagina: int


class StudentSummary(BaseModel):
    id_aluno: int
    aluno: str
    idade: int
    genero: str
    total_registros: int
    presencas: int
    taxa_presenca: float


class StudentPage(BaseModel):
    itens: List[StudentSummary]
    total: int
    pagina: int
    tamanho_pagina: int
