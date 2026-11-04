import { useRef, useState, type DragEvent } from 'react';
import { CloudUpload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { api, mensagemDeErro } from '../services/api';

interface ResultadoUpload {
  mensagem: string;
  registros_lidos: number;
  presencas_inseridas: number;
  presencas_atualizadas: number;
  alunos_novos: number;
}

interface UploadAreaProps {
  onConcluido?: () => void;
}

const TAMANHO_MAXIMO = 10 * 1024 * 1024;

export function UploadArea({ onConcluido }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [arrastando, setArrastando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoUpload | null>(null);
  const [erro, setErro] = useState('');

  async function enviar(arquivo: File) {
    setResultado(null);
    setErro('');
    if (!/\.(csv|xlsx)$/i.test(arquivo.name)) {
      setErro('Formato inválido. Envie um arquivo .csv ou .xlsx.');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('Arquivo maior que 10 MB.');
      return;
    }

    const formulario = new FormData();
    formulario.append('file', arquivo);
    setEnviando(true);
    try {
      const resposta = await api.post<ResultadoUpload>('/upload', formulario);
      setResultado(resposta.data);
      onConcluido?.();
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível importar a planilha.'));
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function aoSoltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setArrastando(false);
    const arquivo = evento.dataTransfer.files[0];
    if (arquivo) enviar(arquivo);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 text-blue-600">
        <CloudUpload size={24} />
        <h2 className="text-lg font-semibold text-slate-800">Upload de Planilha</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Envie um arquivo .csv ou .xlsx com as colunas: id_aluno, idade, genero, data, presenca_semana_anterior e presenca.
        Registros do mesmo aluno na mesma data são atualizados.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={aoSoltar}
        className={clsx(
          'flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors',
          arrastando ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100',
        )}
      >
        {enviando ? <Loader2 size={48} className="text-blue-500 mb-4 animate-spin" /> : <CloudUpload size={48} className="text-slate-400 mb-4" />}
        <p className="text-slate-600 font-medium mb-2">{enviando ? 'Importando planilha...' : 'Arraste e solte seu arquivo aqui'}</p>
        <p className="text-slate-400 text-sm mb-4">ou</p>
        <button
          type="button"
          disabled={enviando}
          onClick={() => inputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Selecionar Arquivo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx"
          className="hidden"
          onChange={(e) => { const arquivo = e.target.files?.[0]; if (arquivo) enviar(arquivo); }}
        />
        <p className="text-xs text-slate-400 mt-6">Formatos aceitos: .xlsx, .csv (máx. 10MB)</p>
      </div>

      {resultado && (
        <div role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 flex gap-2">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          <span>
            {resultado.mensagem} {resultado.registros_lidos} registros lidos: {resultado.presencas_inseridas} novos,{' '}
            {resultado.presencas_atualizadas} atualizados, {resultado.alunos_novos} alunos novos.
          </span>
        </div>
      )}
      {erro && (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 flex gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{erro}</span>
        </div>
      )}
    </div>
  );
}
