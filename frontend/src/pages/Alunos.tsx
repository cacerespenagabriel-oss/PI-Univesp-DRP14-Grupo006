import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { MainLayout } from '../layouts/MainLayout';
import { Pagination } from '../components/Pagination';
import { Carregando, Erro } from '../components/StatusMessage';
import { useApi } from '../hooks/useApi';
import type { Pagina, ResumoAluno } from '../types';
import { formatarPercentual } from '../utils/format';

const TAMANHO_PAGINA = 20;

function corDaTaxa(taxa: number) {
  if (taxa >= 75) return 'bg-green-500';
  if (taxa >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function Alunos() {
  const [busca, setBusca] = useState('');
  const [genero, setGenero] = useState('');
  const [ordenar, setOrdenar] = useState('id');
  const [pagina, setPagina] = useState(1);

  const { data, loading, error, recarregar } = useApi<Pagina<ResumoAluno>>('/alunos', {
    busca: busca || undefined, genero: genero || undefined, ordenar, pagina, tamanho_pagina: TAMANHO_PAGINA,
  });

  return (
    <MainLayout titulo="Alunos" subtitulo="Taxa de presença de cada aluno em todo o período registrado.">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-800">
            <Users size={20} />
            <h2 className="text-lg font-semibold">Lista de alunos</h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="relative">
              <span className="sr-only">Buscar pelo número do aluno</span>
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                value={busca}
                inputMode="numeric"
                onChange={(e) => { setBusca(e.target.value.replace(/\D/g, '')); setPagina(1); }}
                placeholder="Número do aluno"
                className="h-9 w-44 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800"
              />
            </label>
            <label className="text-sm text-slate-600 flex items-center gap-2">
              Gênero
              <select value={genero} onChange={(e) => { setGenero(e.target.value); setPagina(1); }} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-slate-800">
                <option value="">Todos</option>
                <option>Feminino</option>
                <option>Masculino</option>
                <option>Outro</option>
                <option value="Nao informado">Não informado</option>
              </select>
            </label>
            <label className="text-sm text-slate-600 flex items-center gap-2">
              Ordenar
              <select value={ordenar} onChange={(e) => { setOrdenar(e.target.value); setPagina(1); }} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-slate-800">
                <option value="id">Número</option>
                <option value="menor_presenca">Menor presença</option>
                <option value="maior_presenca">Maior presença</option>
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div className="p-6"><Erro mensagem={error} onTentarDeNovo={recarregar} /></div>
        ) : loading && !data ? (
          <Carregando />
        ) : (
          <div className={clsx('overflow-x-auto transition-opacity', loading && 'opacity-60')}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="py-3 px-6 font-medium">Aluno</th>
                  <th className="py-3 px-6 font-medium">Idade</th>
                  <th className="py-3 px-6 font-medium">Gênero</th>
                  <th className="py-3 px-6 font-medium">Presenças</th>
                  <th className="py-3 px-6 font-medium w-1/3">Taxa de presença</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data?.itens.map((aluno) => (
                  <tr key={aluno.id_aluno} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 text-slate-800 font-medium">{aluno.aluno}</td>
                    <td className="py-3 px-6 text-slate-600">{aluno.idade}</td>
                    <td className="py-3 px-6 text-slate-600">{aluno.genero === 'Nao informado' ? 'Não informado' : aluno.genero}</td>
                    <td className="py-3 px-6 text-slate-600">{aluno.presencas} de {aluno.total_registros}</td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
                          <div className={clsx('h-full rounded-full', corDaTaxa(aluno.taxa_presenca))} style={{ width: `${aluno.taxa_presenca}%` }} />
                        </div>
                        <span className="w-14 text-right text-slate-800 font-medium">{formatarPercentual(aluno.taxa_presenca)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {data?.itens.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">Nenhum aluno encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pagination pagina={pagina} total={data.total} tamanhoPagina={TAMANHO_PAGINA} onMudar={setPagina} />}
      </div>
    </MainLayout>
  );
}
