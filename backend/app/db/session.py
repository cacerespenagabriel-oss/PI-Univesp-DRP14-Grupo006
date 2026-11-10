"""Sessão do banco usada pelas rotas, com criação das tabelas e carga inicial do CSV."""
from collections.abc import Iterator

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import CSV_INICIAL
from app.db.database import Base, SessionLocal, engine
from app.db.models import Presenca

_inicializado = False


def inicializar_banco() -> None:
    """Cria as tabelas (se não existirem) e, com o banco vazio, carrega o CSV inicial."""
    global _inicializado
    if _inicializado:
        return
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        vazio = db.scalar(select(func.count()).select_from(Presenca)) == 0
        if vazio and CSV_INICIAL.exists():
            from app.services.importacao import importar_registros, ler_planilha

            registros = ler_planilha(CSV_INICIAL.read_bytes(), CSV_INICIAL.name)
            importar_registros(db, registros)
    _inicializado = True


def get_db() -> Iterator[Session]:
    inicializar_banco()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
