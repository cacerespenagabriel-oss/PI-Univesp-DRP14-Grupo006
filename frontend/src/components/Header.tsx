import { Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Olá, Usuário!</h1>
        <p className="text-slate-500 mt-1">Gerencie as frequências e visualize os resultados.</p>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
