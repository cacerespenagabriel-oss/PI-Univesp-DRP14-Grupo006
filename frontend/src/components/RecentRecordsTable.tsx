import { useState } from 'react';
import { ListTodo, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { useApi } from '../hooks/useApi';
import { api, mensagemDeErro } from '../services/api';
import type { Pagina, RegistroFrequencia } from '../types';
import { capitalizar, formatarData } from '../utils/format';
import { Pagination } from './Pagination';
import { Carregando, Erro } from './StatusMessage';

interface RecentRecordsTableProps {
  dataIso?: string;
  versao?: number;
}

const TAMANHO_PAGINA = 10;

export function RecentRecordsTable({ dataIso, versao = 0 }: RecentRecordsTableProps) {
  const [status, setStatus] = useState<'' | 'Presente' | 'Ausente'>('');
  const [pagina, setPagina] = useState(1);
  const [erroExportar, setErroExportar] = useState('');

  const { data, loading, error, recarregar } = useApi<Pagina<RegistroFrequencia>>('/frequencias', {
    data: dataIso, status: status || undefined, pagina, tamanho_pagina: TAMANHO_PAGINA, versao,
  });

  async function exportar() {
    setErroExportar('');
    try {
      const resposta = await api.get('/relatorios/exportar', { params: { data: dataIso }, responseType: 'blob' });
      const url = URL.createObjectURL(resposta.data as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = dataIso ? `relatorio_frequencia_${dataIso}.csv` : 'relatorio_frequencia.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErroExportar(mensagemDeErro(e, 'Não foi possível exportar o relatório.'));
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 mt-6 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-800">
          <ListTodo size={20} />
          <h2 className="text-lg font-semibold">Registros {dataIso ? `de ${formatarData(dataIso)}` : ''}</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600 flex items-center gap-2">
            Status
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as typeof status); setPagina(1); }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-slate-800"
            >
              <option value="">Todos</option>
              <option value="Presente">Presentes</option>
              <option value="Ausente">Ausentes</option>
            </select>
          </label>
          <button
            type="button"
            onClick={exportar}
            className="h-9 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center gap-2"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>
      {erroExportar && <div className="px-6 pt-4"><Erro mensagem={erroExportar} /></div>}

      {error ? (
        <div className="p-6"><Erro mensagem={error} onTentarDeNovo={recarregar} /></div>
      ) : loading && !data ? (
        <Carregando />
      ) : (
        <div className={clsx('overflow-x-auto transition-opacity', loading && 'opacity-60')}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="py-3 px-6 font-medium">Data</th>
                <th className="py-3 px-6 font-medium">Dia</th>
                <th className="py-3 px-6 font-medium">Aluno</th>
                <th className="py-3 px-6 font-medium">Idade</th>
                <th className="py-3 px-6 font-medium">Gênero</th>
                <th className="py-3 px-6 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data?.itens.map((registro) => (
                <tr key={registro.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-slate-600">{registro.data}</td>
                  <td className="py-4 px-6 text-slate-600">{capitalizar(registro.dia_semana)}</td>
                  <td className="py-4 px-6 text-slate-800 font-medium">{registro.aluno}</td>
                  <td className="py-4 px-6 text-slate-600">{registro.idade}</td>
                  <td className="py-4 px-6 text-slate-600">{registro.genero}</td>
                  <td className="py-4 px-6">
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      registro.status === 'Presente'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200',
                    )}>
                      {registro.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data?.itens.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {data && <Pagination pagina={pagina} total={data.total} tamanhoPagina={TAMANHO_PAGINA} onMudar={setPagina} />}
    </div>
  );
}
