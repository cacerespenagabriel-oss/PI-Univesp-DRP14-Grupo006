export interface DashboardResumo {
  data_referencia: string
  total_alunos: number
  presentes: number
  percentual_presentes: number
  ausentes: number
  percentual_ausentes: number
  media_presenca_periodo: number
}

export interface PontoGrafico {
  data: string
  data_iso: string
  presentes: number
  ausentes: number
}

export interface DashboardData {
  resumo: DashboardResumo
  grafico: PontoGrafico[]
  datas_disponiveis: string[]
}

export interface RegistroFrequencia {
  id: number
  data: string
  dia_semana: string
  id_aluno: number
  aluno: string
  idade: number
  genero: string
  status: 'Presente' | 'Ausente'
}

export interface Pagina<T> {
  itens: T[]
  total: number
  pagina: number
  tamanho_pagina: number
}

export interface ResumoAluno {
  id_aluno: number
  aluno: string
  idade: number
  genero: string
  total_registros: number
  presencas: number
  taxa_presenca: number
}

export interface PrevisaoDia {
  data: string
  dia_semana: string
  presentes_previstos: number
  ausentes_previstos: number
  percentual_previsto: number
  percentual_historico: number
}

export interface AlunoEmRisco {
  id_aluno: number
  idade: number
  genero: string
  probabilidade_presenca: number
  taxa_presenca_historica: number
}

export interface MetricasModelo {
  algoritmo: string
  profundidade_maxima: number
  registros_treino: number
  registros_teste: number
  acuracia: number
  acuracia_base: number
  mae: number
  por_dia: { dia_semana: string; mae: number; acuracia: number; registros_teste: number }[]
  importancia_variaveis: { variavel: string; importancia: number }[]
}

export interface Previsao {
  ultima_data_com_dados: string
  total_alunos: number
  dias: PrevisaoDia[]
  alunos_em_risco: AlunoEmRisco[]
  metricas: MetricasModelo
}
