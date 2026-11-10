import csv
import io
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import verificar_token
from app.db.models import Aluno, Presenca
from app.db.session import get_db

router = APIRouter(prefix="/relatorios", tags=["Relatórios"], dependencies=[Depends(verificar_token)])


@router.get("/exportar")
def exportar_relatorio(
    data: Optional[date] = Query(None, description="Exportar só um dia (padrão: tudo)"),
    db: Session = Depends(get_db),
):
    """Baixa os registros em CSV, no mesmo formato aceito pelo upload."""
    consulta = (
        select(Presenca, Aluno)
        .join(Aluno, Aluno.id_aluno == Presenca.id_aluno)
        .order_by(Presenca.data, Presenca.id_aluno)
    )
    if data:
        consulta = consulta.where(Presenca.data == data)

    saida = io.StringIO()
    escritor = csv.writer(saida, delimiter=";")
    escritor.writerow(["id_aluno", "idade", "genero", "data", "dia_semana", "presenca_semana_anterior", "presenca"])
    for p, a in db.execute(consulta):
        escritor.writerow([
            a.id_aluno, a.idade, a.genero, p.data.strftime("%d/%m/%Y"),
            p.dia_semana, p.presenca_semana_anterior, p.presenca,
        ])

    nome = f"relatorio_frequencia_{data.isoformat()}.csv" if data else "relatorio_frequencia.csv"
    return Response(
        content=saida.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{nome}"'},
    )
