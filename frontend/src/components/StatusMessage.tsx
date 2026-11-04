import { AlertCircle, Loader2 } from 'lucide-react';

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-500" role="status">
      <Loader2 size={20} className="animate-spin" /> {texto}
    </div>
  );
}

export function Erro({ mensagem, onTentarDeNovo }: { mensagem: string; onTentarDeNovo?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-3">
      <AlertCircle size={18} className="shrink-0" />
      <span className="flex-1">{mensagem}</span>
      {onTentarDeNovo && (
        <button type="button" onClick={onTentarDeNovo} className="font-semibold underline">Tentar de novo</button>
      )}
    </div>
  );
}
