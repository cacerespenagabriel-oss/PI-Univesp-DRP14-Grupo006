"""Configurações lidas de variáveis de ambiente (ou do arquivo backend/.env)."""
import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_DIR = BACKEND_DIR.parent


def _carregar_env(caminho: Path) -> None:
    """Lê um arquivo .env simples (CHAVE=valor) sem depender de bibliotecas extras."""
    if not caminho.exists():
        return
    for linha in caminho.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        chave, valor = linha.split("=", 1)
        os.environ.setdefault(chave.strip(), valor.strip().strip('"').strip("'"))


_carregar_env(BACKEND_DIR / ".env")

# Banco de dados. Sem DATABASE_URL, usa um arquivo SQLite local (bom para desenvolvimento).
# Em produção, use a URL do Supabase (Postgres).
DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{BACKEND_DIR / 'frequencia.db'}"

# CSV usado para popular o banco automaticamente quando ele estiver vazio.
CSV_INICIAL = Path(os.getenv("CSV_INICIAL", REPO_DIR / "dados_presenca_alunos_1_mes.csv"))

# Login do administrador e chave usada para assinar os tokens.
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@frequencia.com")
ADMIN_SENHA = os.getenv("ADMIN_SENHA", "123456")
SECRET_KEY = os.getenv("SECRET_KEY", "troque-esta-chave-em-producao")
TOKEN_HORAS = int(os.getenv("TOKEN_HORAS", "12"))

# Endereços do front-end autorizados a chamar a API (separados por vírgula). "*" libera todos.
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
