import { BrainCircuit, Target, AlertTriangle, CalendarRange, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MainLayout } from '../layouts/MainLayout';
import { KpiCard } from '../components/KpiCard';
import { Carregando, Erro } from '../components/StatusMessage';
import { useApi } from '../hooks/useApi';
import type { Previsao } from '../types';
import { capitalizar, formatarData, formatarPercentual } from '../utils/format';

const NOMES_VARIAVEIS: Record<string, string> = {
  idade: 'Idade',
  presenca_semana_anterior: 'Presença na semana anterior',
};

function nomeVariavel(nome: string) {
  if (NOMES_VARIAVEIS[nome]) return NOMES_VARIAVEIS[nome];
  if (nome.startsWith('genero_')) return `Gênero: ${nome.replace('genero_', '').replace('Nao', 'Não')}`;
  if (nome.startsWith('dia_semana_')) return `Dia: ${nome.replace('dia_semana_', '')}`;
  return nome;
}

export function Previsoes() {
  const { data, loading, error, recarregar } = useApi<Previsao>('/previsao');

  return (
    <MainLayout titulo="Previsões" subtitulo="Presença esperada para os próximos 7 dias, calculada pelo modelo de machine learning.">
      {error && <Erro mensagem={error} onTentarDeNovo={recarregar} />}
      {loading && !data && <Carregando texto="Treinando o modelo e calculando a previsão..." />}

      {data && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Acurácia do modelo"
              value={formatarPercentual(data.metricas.acuracia * 100)}
              percentage={`base ${formatarPercentual(data.metricas.acuracia_base * 100)}`}
              icon={<Target size={20} />}
              variant="blue"
            />
            <KpiCard title="Erro médio (MAE)" value={data.metricas.mae.toLocaleString('pt-BR')} icon={<BrainCircuit size={20} />} variant="purple" />
            <KpiCard
              title="Presença média prevista"
              value={formatarPercentual(data.dias.reduce((s, d) => s + d.percentual_previsto, 0) / data.dias.length)}
              icon={<CalendarRange size={20} />}
              variant="green"
            />
            <KpiCard title="Dados até" value={formatarData(data.ultima_data_com_dados)} icon={<Info size={20} />} variant="red" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-2 text-slate-800 mb-1">
              <CalendarRange size={20} />
              <h2 className="text-lg font-semibold">Presença prevista na próxima semana</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Comparação entre o percentual previsto pelo modelo e a média histórica de cada dia da semana ({data.total_alunos} alunos).
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.dias.map((d) => ({ ...d, rotulo: `${capitalizar(d.dia_semana.replace('-feira', ''))} ${formatarData(d.data).slice(0, 5)}` }))}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="rotulo" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} unit="%" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    formatter={(valor) => `${valor}%`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                  />
                  <Legend />
                  <Bar dataKey="percentual_previsto" name="Previsto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="percentual_historico" name="Média histórica" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-4 font-medium">Data</th>
                    <th className="py-3 px-4 font-medium">Dia</th>
                    <th className="py-3 px-4 font-medium">Presentes previstos</th>
                    <th className="py-3 px-4 font-medium">Ausentes previstos</th>
                    <th className="py-3 px-4 font-medium">Previsto</th>
                    <th className="py-3 px-4 font-medium">Histórico</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dias.map((d) => (
                    <tr key={d.data} className="border-b border-slate-50">
                      <td className="py-3 px-4 text-slate-600">{formatarData(d.data)}</td>
                      <td className="py-3 px-4 text-slate-600">{capitalizar(d.dia_semana)}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{d.presentes_previstos}</td>
                      <td className="py-3 px-4 text-slate-600">{d.ausentes_previstos}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{formatarPercentual(d.percentual_previsto)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatarPercentual(d.percentual_historico)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-800">
                  <AlertTriangle size={20} />
                  <h2 className="text-lg font-semibold">Alunos com maior risco de falta</h2>
                </div>
                <p className="text-sm text-slate-500 mt-1">Menor chance média de presença prevista para a próxima semana.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                      <th className="py-3 px-4 font-medium">Aluno</th>
                      <th className="py-3 px-4 font-medium">Idade</th>
                      <th className="py-3 px-4 font-medium">Chance prevista</th>
                      <th className="py-3 px-4 font-medium">Histórico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.alunos_em_risco.map((a) => (
                      <tr key={a.id_aluno} className="border-b border-slate-50">
                        <td className="py-3 px-4 text-slate-800 font-medium">Aluno {a.id_aluno}</td>
                        <td className="py-3 px-4 text-slate-600">{a.idade}</td>
                        <td className="py-3 px-4 text-red-700 font-medium">{formatarPercentual(a.probabilidade_presenca)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatarPercentual(a.taxa_presenca_historica)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 text-slate-800">
                  <BrainCircuit size={20} />
                  <h2 className="text-lg font-semibold">Como o modelo funciona</h2>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {data.metricas.algoritmo}, com profundidade máxima {data.metricas.profundidade_maxima}. Treinado com{' '}
                  {data.metricas.registros_treino} registros e testado com {data.metricas.registros_teste} registros que ele não viu no treino.
                  A acurácia é comparada com a de um chute fixo na resposta mais comum ({formatarPercentual(data.metricas.acuracia_base * 100)}).
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">O que mais pesa na previsão</h3>
                <ul className="space-y-2">
                  {data.metricas.importancia_variaveis.slice(0, 6).map((v) => (
                    <li key={v.variavel} className="flex items-center gap-3 text-sm">
                      <span className="w-52 shrink-0 text-slate-600">{nomeVariavel(v.variavel)}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${v.importancia * 100}%` }} />
                      </div>
                      <span className="w-12 text-right text-slate-800">{formatarPercentual(v.importancia * 100)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Erro por dia da semana (dados de teste)</h3>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-100">
                      <th className="py-2 font-medium">Dia</th>
                      <th className="py-2 font-medium">MAE</th>
                      <th className="py-2 font-medium">Acurácia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.metricas.por_dia.map((d) => (
                      <tr key={d.dia_semana} className="border-b border-slate-50">
                        <td className="py-2 text-slate-600">{capitalizar(d.dia_semana)}</td>
                        <td className="py-2 text-slate-800">{d.mae.toLocaleString('pt-BR')}</td>
                        <td className="py-2 text-slate-800">{formatarPercentual(d.acuracia * 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
