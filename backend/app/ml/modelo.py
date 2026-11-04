"""Modelo de machine learning: prevê a chance de cada aluno comparecer em um dia.

Pipeline:
  1. Lê do banco todas as presenças (com idade e gênero do aluno).
  2. Transforma cada registro em números (one-hot de gênero e dia da semana).
  3. Separa 25% dos dados para teste, treina uma árvore de decisão e mede o erro.
  4. Treina de novo com 100% dos dados e usa esse modelo para prever a próxima semana.

O modelo fica guardado em memória e é refeito sozinho quando os dados mudam
(por exemplo, depois de um upload de planilha).
"""
from dataclasses import dataclass, field
from datetime import date, timedelta
from threading import Lock

import numpy as np
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import Aluno, Presenca
from app.services.importacao import DIAS_SEMANA, GENEROS, dia_da_semana

# Hiperparâmetros escolhidos com validação cruzada (5 partes) sobre o CSV original.
# Uma árvore sem limite de profundidade "decora" os dados e acerta só ~59%;
# limitando a profundidade ela acerta ~65% (chutar sempre "presente" acerta ~58%).
PROFUNDIDADE_MAXIMA = 5
MINIMO_POR_FOLHA = 20
SEMENTE = 42

NOMES_FEATURES = (
    ["idade", "presenca_semana_anterior"]
    + [f"genero_{g}" for g in GENEROS]
    + [f"dia_semana_{d}" for d in DIAS_SEMANA]
)


def montar_features(idade: int, genero: str, dia_semana: str, presenca_semana_anterior: int) -> list[float]:
    """Transforma um registro em vetor numérico. O id do aluno não entra: ele não descreve o aluno."""
    return (
        [float(idade), float(presenca_semana_anterior)]
        + [1.0 if genero == g else 0.0 for g in GENEROS]
        + [1.0 if dia_semana == d else 0.0 for d in DIAS_SEMANA]
    )


@dataclass
class ModeloTreinado:
    arvore: DecisionTreeClassifier
    versao_dados: tuple
    metricas: dict = field(default_factory=dict)

    def probabilidade(self, linhas: list[list[float]]) -> np.ndarray:
        """Probabilidade de presença (classe 1) para cada linha."""
        if not linhas:
            return np.array([])
        probs = self.arvore.predict_proba(np.array(linhas))
        classes = list(self.arvore.classes_)
        if 1 not in classes:
            return np.zeros(len(linhas))
        return probs[:, classes.index(1)]


_cache: ModeloTreinado | None = None
_trava = Lock()


def _versao_dados(db: Session) -> tuple:
    total, ultima, soma = db.execute(
        select(func.count(Presenca.id), func.max(Presenca.data), func.sum(Presenca.presenca))
    ).one()
    return (total, ultima, soma)


def _carregar_dados(db: Session) -> tuple[np.ndarray, np.ndarray, list[str]]:
    consulta = select(
        Aluno.idade, Aluno.genero, Presenca.dia_semana, Presenca.presenca_semana_anterior, Presenca.presenca
    ).join(Aluno, Aluno.id_aluno == Presenca.id_aluno)
    X, y, dias = [], [], []
    for idade, genero, dia, anterior, presenca in db.execute(consulta):
        X.append(montar_features(idade, genero, dia, anterior))
        y.append(presenca)
        dias.append(dia)
    return np.array(X), np.array(y), dias


def _nova_arvore() -> DecisionTreeClassifier:
    return DecisionTreeClassifier(
        max_depth=PROFUNDIDADE_MAXIMA, min_samples_leaf=MINIMO_POR_FOLHA, random_state=SEMENTE
    )


def treinar(db: Session) -> ModeloTreinado:
    X, y, dias = _carregar_dados(db)
    if len(y) < 20 or len(set(y.tolist())) < 2:
        raise ValueError("Dados insuficientes para treinar o modelo.")

    # 1) Avaliação: treina com 75% e testa com 25% que o modelo nunca viu.
    indices = np.arange(len(y))
    idx_treino, idx_teste = train_test_split(indices, test_size=0.25, random_state=SEMENTE, stratify=y)
    arvore_teste = _nova_arvore().fit(X[idx_treino], y[idx_treino])
    classes = list(arvore_teste.classes_)
    prob_teste = arvore_teste.predict_proba(X[idx_teste])[:, classes.index(1)]
    y_teste = y[idx_teste]
    dias_teste = np.array(dias)[idx_teste]

    por_dia = []
    for dia in DIAS_SEMANA:
        filtro = dias_teste == dia
        if filtro.sum() == 0:
            continue
        por_dia.append({
            "dia_semana": dia,
            "mae": round(float(mean_absolute_error(y_teste[filtro], prob_teste[filtro])), 4),
            "acuracia": round(float(accuracy_score(y_teste[filtro], prob_teste[filtro] >= 0.5)), 4),
            "registros_teste": int(filtro.sum()),
        })

    importancias = sorted(
        zip(NOMES_FEATURES, arvore_teste.feature_importances_), key=lambda par: par[1], reverse=True
    )

    metricas = {
        "algoritmo": "Árvore de decisão (DecisionTreeClassifier)",
        "profundidade_maxima": PROFUNDIDADE_MAXIMA,
        "registros_treino": int(len(idx_treino)),
        "registros_teste": int(len(idx_teste)),
        "acuracia": round(float(accuracy_score(y_teste, prob_teste >= 0.5)), 4),
        "acuracia_base": round(float(max(y_teste.mean(), 1 - y_teste.mean())), 4),
        "mae": round(float(mean_absolute_error(y_teste, prob_teste)), 4),
        "por_dia": por_dia,
        "importancia_variaveis": [
            {"variavel": nome, "importancia": round(float(valor), 4)} for nome, valor in importancias if valor > 0
        ],
    }

    # 2) Modelo final: treina com todos os dados.
    arvore_final = _nova_arvore().fit(X, y)
    return ModeloTreinado(arvore=arvore_final, versao_dados=_versao_dados(db), metricas=metricas)


def obter_modelo(db: Session) -> ModeloTreinado:
    """Devolve o modelo em memória, treinando de novo se os dados do banco mudaram."""
    global _cache
    versao = _versao_dados(db)
    with _trava:
        if _cache is None or _cache.versao_dados != versao:
            _cache = treinar(db)
        return _cache


def prever_proxima_semana(db: Session) -> dict:
    """Prevê a presença de cada aluno nos 7 dias seguintes ao último dia com dados."""
    modelo = obter_modelo(db)
    ultima_data: date | None = db.scalar(select(func.max(Presenca.data)))
    if ultima_data is None:
        raise ValueError("Não há dados de presença no banco.")

    alunos = list(db.scalars(select(Aluno).order_by(Aluno.id_aluno)))
    inicio_janela = ultima_data - timedelta(days=6)
    ultima_semana = {
        (p.id_aluno, p.data): p.presenca
        for p in db.scalars(select(Presenca).where(Presenca.data >= inicio_janela))
    }
    taxa_por_aluno = dict(db.execute(
        select(Presenca.id_aluno, func.avg(Presenca.presenca)).group_by(Presenca.id_aluno)
    ).all())

    dias_futuros = [ultima_data + timedelta(days=i) for i in range(1, 8)]
    linhas, chaves = [], []
    for aluno in alunos:
        for d in dias_futuros:
            # "presença na semana anterior" = presença no mesmo dia da semana passada.
            anterior = ultima_semana.get((aluno.id_aluno, d - timedelta(days=7)))
            if anterior is None:
                anterior = 1 if float(taxa_por_aluno.get(aluno.id_aluno) or 0) >= 0.5 else 0
            linhas.append(montar_features(aluno.idade, aluno.genero, dia_da_semana(d), anterior))
            chaves.append((aluno.id_aluno, d))

    probabilidades = modelo.probabilidade(linhas)

    por_dia: dict[date, list[float]] = {d: [] for d in dias_futuros}
    por_aluno: dict[int, list[float]] = {a.id_aluno: [] for a in alunos}
    for (id_aluno, d), prob in zip(chaves, probabilidades):
        por_dia[d].append(float(prob))
        por_aluno[id_aluno].append(float(prob))

    media_historica = dict(db.execute(
        select(Presenca.dia_semana, func.avg(Presenca.presenca)).group_by(Presenca.dia_semana)
    ).all())

    total_alunos = len(alunos)
    previsao_dias = []
    for d in dias_futuros:
        esperados = sum(por_dia[d])
        previsao_dias.append({
            "data": d.isoformat(),
            "dia_semana": dia_da_semana(d),
            "presentes_previstos": round(esperados),
            "ausentes_previstos": total_alunos - round(esperados),
            "percentual_previsto": round(100 * esperados / total_alunos, 1) if total_alunos else 0.0,
            "percentual_historico": round(100 * float(media_historica.get(dia_da_semana(d)) or 0), 1),
        })

    info_aluno = {a.id_aluno: a for a in alunos}
    risco = sorted(
        (
            {
                "id_aluno": id_aluno,
                "idade": info_aluno[id_aluno].idade,
                "genero": info_aluno[id_aluno].genero,
                "probabilidade_presenca": round(100 * sum(probs) / len(probs), 1),
                "taxa_presenca_historica": round(100 * float(taxa_por_aluno.get(id_aluno) or 0), 1),
            }
            for id_aluno, probs in por_aluno.items() if probs
        ),
        key=lambda item: (item["probabilidade_presenca"], item["taxa_presenca_historica"]),
    )

    return {
        "ultima_data_com_dados": ultima_data.isoformat(),
        "total_alunos": total_alunos,
        "dias": previsao_dias,
        "alunos_em_risco": risco[:15],
        "metricas": modelo.metricas,
    }
