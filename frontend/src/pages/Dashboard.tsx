import { useState } from 'react';
import { Users, CheckCircle2, XCircle, Percent, CalendarDays } from 'lucide-react';
import { MainLayout } from '../layouts/MainLayout';
import { UploadArea } from '../components/UploadArea';
import { KpiCard } from '../components/KpiCard';
import { FrequencyChart } from '../components/FrequencyChart';
import { RecentRecordsTable } from '../components/RecentRecordsTable';
import { Carregando, Erro } from '../components/StatusMessage';
import { useApi } from '../hooks/useApi';
import type { DashboardData } from '../types';
import { formatarData, formatarPercentual } from '../utils/format';

export function Dashboard() {
  const [dataSelecionada, setDataSelecionada] = useState<string | undefined>();
  const [versao, setVersao] = useState(0);
  const { data, loading, error, recarregar } = useApi<DashboardData>('/dashboard', { data: dataSelecionada, versao });

  const resumo = data?.resumo;
  const dataAtual = resumo?.data_referencia;

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo - Upload */}
        <div className="lg:col-span-5">
          <UploadArea onConcluido={() => setVersao((v) => v + 1)} />
        </div>

        {/* Lado Direito - KPIs e Gráfico */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {error && <Erro mensagem={error} onTentarDeNovo={recarregar} />}
          {!data && loading && <Carregando texto="Carregando indicadores..." />}

          {resumo && data && (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-slate-500">Os cards mostram o dia selecionado.</p>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays size={16} />
                  Dia
                  <select
                    value={dataAtual}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-slate-800"
                  >
                    {[...data.datas_disponiveis].reverse().map((d) => (
                      <option key={d} value={d}>{formatarData(d)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard title="Total de Alunos" value={resumo.total_alunos} icon={<Users size={20} />} variant="blue" />
                <KpiCard
                  title="Presentes"
                  value={resumo.presentes}
                  percentage={formatarPercentual(resumo.percentual_presentes)}
                  icon={<CheckCircle2 size={20} />}
                  variant="green"
                />
                <KpiCard
                  title="Ausentes"
                  value={resumo.ausentes}
                  percentage={formatarPercentual(resumo.percentual_ausentes)}
                  icon={<XCircle size={20} />}
                  variant="red"
                />
                <KpiCard
                  title="Média geral"
                  value={formatarPercentual(resumo.media_presenca_periodo)}
                  icon={<Percent size={20} />}
                  variant="purple"
                />
              </div>

              <div className="flex-1">
                <FrequencyChart dados={data.grafico} dataSelecionada={dataAtual} onSelecionarData={setDataSelecionada} />
              </div>
            </>
          )}
        </div>
      </div>

      {dataAtual && <RecentRecordsTable key={dataAtual} dataIso={dataAtual} versao={versao} />}
    </MainLayout>
  );
}
