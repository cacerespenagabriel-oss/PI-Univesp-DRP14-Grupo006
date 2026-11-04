"""Tabelas do banco.

alunos     -> um registro por aluno (id, idade, gênero)
presencas  -> um registro por aluno por dia (presente ou não)
"""
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Aluno(Base):
    __tablename__ = "alunos"

    id_aluno: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)
    idade: Mapped[int] = mapped_column(Integer)
    genero: Mapped[str] = mapped_column(String(30))

    presencas: Mapped[list["Presenca"]] = relationship(back_populates="aluno")


class Presenca(Base):
    __tablename__ = "presencas"
    __table_args__ = (UniqueConstraint("id_aluno", "data", name="uq_presenca_aluno_data"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    id_aluno: Mapped[int] = mapped_column(ForeignKey("alunos.id_aluno"), index=True)
    data: Mapped[date] = mapped_column(Date, index=True)
    dia_semana: Mapped[str] = mapped_column(String(20))
    presenca_semana_anterior: Mapped[int] = mapped_column(SmallInteger)
    presenca: Mapped[int] = mapped_column(SmallInteger)

    aluno: Mapped[Aluno] = relationship(back_populates="presencas")
