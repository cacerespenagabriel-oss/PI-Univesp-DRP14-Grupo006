import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  pagina: number;
  total: number;
  tamanhoPagina: number;
  onMudar: (pagina: number) => void;
}

export function Pagination({ pagina, total, tamanhoPagina, onMudar }: PaginationProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / tamanhoPagina));
  const inicio = total === 0 ? 0 : (pagina - 1) * tamanhoPagina + 1;
  const fim = Math.min(pagina * tamanhoPagina, total);

  return (
    <div className="p-4 flex items-center justify-between gap-2 border-t border-slate-100 text-sm text-slate-500">
      <span>{inicio}–{fim} de {total}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMudar(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 text-slate-600">Página {pagina} de {totalPaginas}</span>
        <button
          type="button"
          onClick={() => onMudar(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Próxima página"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
