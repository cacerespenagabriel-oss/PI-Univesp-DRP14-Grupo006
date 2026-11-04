import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { PontoGrafico } from '../types';

interface FrequencyChartProps {
  dados: PontoGrafico[];
  dataSelecionada?: string;
  onSelecionarData?: (dataIso: string) => void;
}

export function FrequencyChart({ dados, dataSelecionada, onSelecionarData }: FrequencyChartProps) {
  const selecionado = dados.find((p) => p.data_iso === dataSelecionada)?.data;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-800">
          <TrendingUp size={20} />
          <h2 className="text-lg font-semibold">Fluxo de Frequência</h2>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">Presentes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-slate-600">Ausentes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dados}
            margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            onClick={(estado) => {
              const indice = Number(estado?.activeTooltipIndex);
              const ponto = Number.isInteger(indice) ? dados[indice] : undefined;
              if (ponto && onSelecionarData) onSelecionarData(ponto.data_iso);
            }}
            style={{ cursor: onSelecionarData ? 'pointer' : undefined }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} minTickGap={16} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }} />
            {selecionado && <ReferenceLine x={selecionado} stroke="#94a3b8" strokeDasharray="4 4" />}
            <Line type="monotone" dataKey="presentes" name="Presentes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="ausentes" name="Ausentes" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {onSelecionarData && <p className="text-xs text-slate-500 mt-3">Clique em um dia do gráfico para ver os detalhes dele.</p>}
    </div>
  );
}
