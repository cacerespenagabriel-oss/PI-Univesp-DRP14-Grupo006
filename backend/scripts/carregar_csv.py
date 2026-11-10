"""Carrega um CSV/XLSX de presenças no banco configurado em DATABASE_URL.

Uso (dentro da pasta backend):
    python -m scripts.carregar_csv                      # usa o CSV da raiz do repositório
    python -m scripts.carregar_csv caminho/arquivo.csv  # usa outro arquivo
"""
import sys
from pathlib import Path

from app.config import CSV_INICIAL
from app.db.database import URL, Base, SessionLocal, engine
from app.services.importacao import importar_registros, ler_planilha


def main() -> None:
    caminho = Path(sys.argv[1]) if len(sys.argv) > 1 else CSV_INICIAL
    print(f"Banco: {URL.split('@')[-1]}")
    print(f"Arquivo: {caminho}")
    Base.metadata.create_all(engine)
    registros = ler_planilha(caminho.read_bytes(), caminho.name)
    with SessionLocal() as db:
        resultado = importar_registros(db, registros)
    for chave, valor in resultado.items():
        print(f"  {chave}: {valor}")


if __name__ == "__main__":
    main()
