from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import Integer, String, cast, func, select
from sqlalchemy.orm import Session

from app.core.security import verificar_token
from app.db.models import Aluno, Presenca
from app.db.session import get_db
from app.routers.frequencias import nome_aluno
from app.schemas.frequencia import StudentPage

router = APIRouter(prefix="/alunos", tags=["Alunos"], dependencies=[Depends(verificar_token)])


@router.get("", response_model=StudentPage)
def listar_alunos(
    busca: Optional[str] = Query(None, description="Parte do número do aluno"),
    genero: Optional[str] = Query(None),
    ordenar: Literal["id", "menor_presenca", "maior_presenca"] = Query("id"),
    pagina: int = Query(1, ge=1),
    tamanho_pagina: int = Query(20, ge=1, le=200),
    db: Session = Depends(get_db),
):
    total_registros = func.count(Presenca.id).label("total_registros")
    presencas = func.coalesce(func.sum(cast(Presenca.presenca, Integer)), 0).label("presencas")
    taxa = (func.coalesce(func.avg(cast(Presenca.presenca, Integer)), 0) * 100).label("taxa")

    filtros = []
    if busca and busca.strip().isdigit():
        filtros.append(cast(Aluno.id_aluno, String).like(f"%{busca.strip()}%"))
    if genero:
        filtros.append(Aluno.genero == genero)

    ordem = {
        "id": [Aluno.id_aluno],
        "menor_presenca": [taxa.asc(), Aluno.id_aluno],
        "maior_presenca": [taxa.desc(), Aluno.id_aluno],
    }[ordenar]

    total = db.scalar(select(func.count()).select_from(Aluno).where(*filtros)) or 0
    consulta = (
        select(Aluno, total_registros, presencas, taxa)
        .outerjoin(Presenca, Presenca.id_aluno == Aluno.id_aluno)
        .where(*filtros)
        .group_by(Aluno.id_aluno, Aluno.idade, Aluno.genero)
        .order_by(*ordem)
        .offset((pagina - 1) * tamanho_pagina)
        .limit(tamanho_pagina)
    )

    itens = [
        {
            "id_aluno": a.id_aluno,
            "aluno": nome_aluno(a.id_aluno),
            "idade": a.idade,
            "genero": a.genero,
            "total_registros": int(total_reg),
            "presencas": int(pres),
            "taxa_presenca": round(float(tx), 1),
        }
        for a, total_reg, pres, tx in db.execute(consulta)
    ]
    return {"itens": itens, "total": total, "pagina": pagina, "tamanho_pagina": tamanho_pagina}

