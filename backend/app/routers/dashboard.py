from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.security import verificar_token
from app.db.models import Aluno, Presenca
from app.db.session import get_db
from app.schemas.frequencia import DashboardData

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(verificar_token)])


def _pct(parte: int, total: int) -> float:
    return round(100 * parte / total, 1) if total else 0.0


@router.get("", response_model=DashboardData)
def get_dashboard_data(
    data: Optional[date] = Query(None, description="Dia de referência dos cards (padrão: último dia com dados)"),
    db: Session = Depends(get_db),
):
    por_dia = db.execute(
        select(
            Presenca.data,
            func.sum(Presenca.presenca),
            func.sum(case((Presenca.presenca == 0, 1), else_=0)),
        ).group_by(Presenca.data).order_by(Presenca.data)
    ).all()

    if not por_dia:
        raise HTTPException(status_code=404, detail="Nenhum dado de presença cadastrado.")

    datas = [d for d, _, _ in por_dia]
    referencia = data or datas[-1]
    if referencia not in datas:
        raise HTTPException(status_code=404, detail="Não há registros para a data informada.")

    presentes_dia = {d: (int(p), int(a)) for d, p, a in por_dia}
    presentes, ausentes = presentes_dia[referencia]
    total_dia = presentes + ausentes
    media = db.scalar(select(func.avg(Presenca.presenca))) or 0
    total_alunos = db.scalar(select(func.count()).select_from(Aluno)) or 0

    return {
        "resumo": {
            "data_referencia": referencia.isoformat(),
            "total_alunos": total_alunos,
            "presentes": presentes,
            "percentual_presentes": _pct(presentes, total_dia),
            "ausentes": ausentes,
            "percentual_ausentes": _pct(ausentes, total_dia),
            "media_presenca_periodo": round(100 * float(media), 1),
        },
        "grafico": [
            {"data": d.strftime("%d/%m"), "data_iso": d.isoformat(), "presentes": int(p), "ausentes": int(a)}
            for d, p, a in por_dia
        ],
        "datas_disponiveis": [d.isoformat() for d in datas],
    }
