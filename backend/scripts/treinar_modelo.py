"""Treina o modelo com os dados do banco e mostra as métricas e a previsão da próxima semana.

Uso (dentro da pasta backend):
    python -m scripts.treinar_modelo
"""
from app.db.session import SessionLocal, inicializar_banco
from app.ml.modelo import prever_proxima_semana


def main() -> None:
    inicializar_banco()
    with SessionLocal() as db:
        resultado = prever_proxima_semana(db)

    m = resultado["metricas"]
    print(f"Modelo: {m['algoritmo']} (profundidade máxima {m['profundidade_maxima']})")
    print(f"Treino: {m['registros_treino']} registros | Teste: {m['registros_teste']} registros")
    print(f"Acurácia no teste: {m['acuracia']:.1%} (chutar sempre a classe mais comum: {m['acuracia_base']:.1%})")
    print(f"Erro médio absoluto (MAE): {m['mae']:.3f}\n")

    print("MAE por dia da semana:")
    for d in m["por_dia"]:
        print(f"  {d['dia_semana']:<14} MAE {d['mae']:.3f}  acurácia {d['acuracia']:.1%}")

    print("\nVariáveis mais importantes:")
    for v in m["importancia_variaveis"]:
        print(f"  {v['variavel']:<28} {v['importancia']:.3f}")

    print(f"\nPrevisão para a semana após {resultado['ultima_data_com_dados']} ({resultado['total_alunos']} alunos):")
    for d in resultado["dias"]:
        print(
            f"  {d['data']} {d['dia_semana']:<14} {d['presentes_previstos']:>3} presentes "
            f"({d['percentual_previsto']}% | histórico {d['percentual_historico']}%)"
        )


if __name__ == "__main__":
    main()
