"""Conexão com o banco de dados (SQLite local ou Postgres/Supabase)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import DATABASE_URL


def _normalizar_url(url: str) -> str:
    # O Supabase fornece "postgres://" ou "postgresql://"; o SQLAlchemy precisa saber o driver.
    for prefixo in ("postgres://", "postgresql://"):
        if url.startswith(prefixo):
            return "postgresql+psycopg://" + url[len(prefixo):]
    return url


URL = _normalizar_url(DATABASE_URL)
E_SQLITE = URL.startswith("sqlite")

if E_SQLITE:
    engine = create_engine(URL, connect_args={"check_same_thread": False})
else:
    # NullPool + prepare_threshold=None funcionam bem com o pooler do Supabase
    # e com funções serverless (Vercel), que abrem e fecham conexões o tempo todo.
    engine = create_engine(
        URL,
        poolclass=NullPool,
        connect_args={"prepare_threshold": None},
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass
