"""Leitura de planilhas (CSV/XLSX) e gravação dos registros no banco."""
import csv
import io
from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Aluno, Presenca

DIAS_SEMANA = [
    "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira",
    "sexta-feira", "sábado", "domingo",
]
GENEROS = ["Feminino", "Masculino", "Outro", "Nao informado"]

COLUNAS_OBRIGATORIAS = {"id_aluno", "idade", "genero", "data", "presenca_semana_anterior", "presenca"}


def dia_da_semana(d: date) -> str:
    return DIAS_SEMANA[d.weekday()]


def _para_data(valor) -> date:
    if isinstance(valor, datetime):
        return valor.date()
    if isinstance(valor, date):
        return valor
    texto = str(valor).strip()
    for formato in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y"):
        try:
            return datetime.strptime(texto, formato).date()
        except ValueError:
            pass
    raise ValueError(f"Data inválida: '{texto}' (use dd/mm/aaaa)")


def _para_binario(valor, coluna: str) -> int:
    texto = str(valor).strip().lower()
    if texto in ("1", "1.0", "sim", "s", "true", "presente"):
        return 1
    if texto in ("0", "0.0", "nao", "não", "n", "false", "ausente"):
        return 0
    raise ValueError(f"Valor inválido em '{coluna}': '{valor}' (use 0 ou 1)")


def _normalizar_genero(valor) -> str:
    texto = str(valor).strip()
    for g in GENEROS:
        if texto.lower() == g.lower() or (g == "Nao informado" and texto.lower() == "não informado"):
            return g
    return "Outro" if texto else "Nao informado"


def _linhas_csv(conteudo: bytes) -> list[dict]:
    texto = conteudo.decode("utf-8-sig", errors="replace")
    primeira_linha = texto.split("\n", 1)[0]
    separador = ";" if primeira_linha.count(";") >= primeira_linha.count(",") else ","
    return list(csv.DictReader(io.StringIO(texto), delimiter=separador))


def _linhas_xlsx(conteudo: bytes) -> list[dict]:
    from openpyxl import load_workbook

    planilha = load_workbook(io.BytesIO(conteudo), read_only=True, data_only=True).active
    linhas = planilha.iter_rows(values_only=True)
    cabecalho = [str(c or "").strip() for c in next(linhas, [])]
    return [dict(zip(cabecalho, linha)) for linha in linhas if any(v is not None for v in linha)]


def ler_planilha(conteudo: bytes, nome_arquivo: str) -> list[dict]:
    """Converte um CSV (separado por ; ou ,) ou XLSX numa lista de registros validados."""
    nome = nome_arquivo.lower()
    if nome.endswith(".csv"):
        linhas = _linhas_csv(conteudo)
    elif nome.endswith(".xlsx"):
        linhas = _linhas_xlsx(conteudo)
    else:
        raise ValueError("Formato inválido. Envie um arquivo .csv ou .xlsx.")

    if not linhas:
        raise ValueError("O arquivo está vazio.")

    linhas = [{str(k).strip().lower(): v for k, v in linha.items() if k} for linha in linhas]
    faltando = COLUNAS_OBRIGATORIAS - set(linhas[0].keys())
    if faltando:
        raise ValueError(f"Colunas ausentes no arquivo: {', '.join(sorted(faltando))}")

    registros = []
    for numero, linha in enumerate(linhas, start=2):
        try:
            data = _para_data(linha["data"])
            registros.append({
                "id_aluno": int(float(linha["id_aluno"])),
                "idade": int(float(linha["idade"])),
                "genero": _normalizar_genero(linha["genero"]),
                "data": data,
                "dia_semana": dia_da_semana(data),
                "presenca_semana_anterior": _para_binario(linha["presenca_semana_anterior"], "presenca_semana_anterior"),
                "presenca": _para_binario(linha["presenca"], "presenca"),
            })
        except (ValueError, TypeError) as erro:
            raise ValueError(f"Linha {numero}: {erro}") from erro
    return registros


def importar_registros(db: Session, registros: list[dict]) -> dict:
    """Grava alunos e presenças. Se já existir presença do aluno na mesma data, ela é atualizada."""
    alunos_existentes = {a.id_aluno: a for a in db.scalars(select(Aluno))}
    alunos_novos = 0
    for r in registros:
        aluno = alunos_existentes.get(r["id_aluno"])
        if aluno is None:
            aluno = Aluno(id_aluno=r["id_aluno"], idade=r["idade"], genero=r["genero"])
            db.add(aluno)
            alunos_existentes[r["id_aluno"]] = aluno
            alunos_novos += 1
        else:
            aluno.idade, aluno.genero = r["idade"], r["genero"]
    db.flush()

    chaves = {(r["id_aluno"], r["data"]) for r in registros}
    existentes = {}
    datas = sorted({d for _, d in chaves})
    if datas:
        consulta = select(Presenca).where(Presenca.data.in_(datas))
        existentes = {(p.id_aluno, p.data): p for p in db.scalars(consulta)}

    inseridos = atualizados = 0
    for r in registros:
        chave = (r["id_aluno"], r["data"])
        p = existentes.get(chave)
        if p is None:
            p = Presenca(
                id_aluno=r["id_aluno"], data=r["data"], dia_semana=r["dia_semana"],
                presenca_semana_anterior=r["presenca_semana_anterior"], presenca=r["presenca"],
            )
            db.add(p)
            existentes[chave] = p
            inseridos += 1
        else:
            p.presenca_semana_anterior = r["presenca_semana_anterior"]
            p.presenca = r["presenca"]
            atualizados += 1
    db.commit()

    return {
        "registros_lidos": len(registros),
        "presencas_inseridas": inseridos,
        "presencas_atualizadas": atualizados,
        "alunos_novos": alunos_novos,
    }
