from datetime import date
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.security import verificar_token
from app.db.models import Aluno, Presenca
from app.db.session import get_db
from app.schemas.frequencia import AttendancePage

router = APIRouter(prefix="/frequencias", tags=["Frequências"], dependencies=[Depends(verificar_token)])


def nome_aluno(id_aluno: int) -> str:
    return f"Aluno {id_aluno}"


@router.get("", response_model=AttendancePage)
def listar_frequencias(
    data: Optional[date] = Query(None, description="Filtrar por um dia"),
    status: Optional[Literal["Presente", "Ausente"]] = Query(None),
    id_aluno: Optional[int] = Query(None, description="Filtrar por um aluno"),
    pagina: int = Query(1, ge=1),
    tamanho_pagina: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    filtros = []
    if data:
        filtros.append(Presenca.data == data)
    if status:
        filtros.append(Presenca.presenca == (1 if status == "Presente" else 0))
    if id_aluno:
        filtros.append(Presenca.id_aluno == id_aluno)

    total = db.scalar(select(func.count()).select_from(Presenca).where(*filtros)) or 0
    consulta = (
        select(Presenca, Aluno)
        .join(Aluno, Aluno.id_aluno == Presenca.id_aluno)
        .where(*filtros)
        .order_by(Presenca.data.desc(), Presenca.id_aluno)
        .offset((pagina - 1) * tamanho_pagina)
        .limit(tamanho_pagina)
    )

    itens = [
        {
            "id": p.id,
            "data": p.data.strftime("%d/%m/%Y"),
            "dia_semana": p.dia_semana,
            "id_aluno": a.id_aluno,
            "aluno": nome_aluno(a.id_aluno),
            "idade": a.idade,
            "genero": a.genero,
            "status": "Presente" if p.presenca else "Ausente",
        }
        for p, a in db.execute(consulta)
    ]
    return {"itens": itens, "total": total, "pagina": pagina, "tamanho_pagina": tamanho_pagina}
