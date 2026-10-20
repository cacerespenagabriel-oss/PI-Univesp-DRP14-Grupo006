import { CalendarDays, Home, FileSpreadsheet, BarChart2, Settings, Accessibility, User } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#1e293b] text-white flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-white text-slate-800 p-1.5 rounded-md">
          <CalendarDays size={20} />
        </div>
        <span className="text-xl font-bold">Frequência+</span>
      </div>

      {/* Menu Principal */}
      <nav className="flex-1 px-4 py-2 space-y-2">
        <a href="#" className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium">
          <Home size={20} />
          Início
        </a>
        <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-lg font-medium transition-colors">
          <FileSpreadsheet size={20} />
          Planilhas
        </a>
        <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-lg font-medium transition-colors">
          <BarChart2 size={20} />
          Relatórios
        </a>
        <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-lg font-medium transition-colors">
          <Settings size={20} />
          Configurações
        </a>
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-slate-700/50 space-y-4">
        {/* Acessibilidade */}
        <div className="flex flex-col gap-3 px-2">
          <div className="flex items-center gap-3 text-slate-300">
            <Accessibility size={20} />
            <span className="font-medium text-sm">Acessibilidade</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <button className="hover:text-white text-sm font-semibold">A</button>
            <button className="hover:text-white text-base font-semibold">A</button>
            <button className="hover:text-white text-lg font-semibold">A</button>
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button className="hover:text-white w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center">
              <span className="block w-3 h-6 bg-white rounded-l-full"></span>
            </button>
          </div>
        </div>

        {/* Usuário Dropdown (Simulado) */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <button className="w-full flex items-center justify-between text-slate-300 hover:text-white px-2 py-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <User size={20} />
              <span className="font-medium">Usuário</span>
            </div>
            <span className="text-xs">▼</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
