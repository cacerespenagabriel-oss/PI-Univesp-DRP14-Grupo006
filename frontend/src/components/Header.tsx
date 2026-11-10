import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  titulo?: string;
  subtitulo?: string;
}

export function Header({ titulo, subtitulo = 'Gerencie as frequências e visualize os resultados.' }: HeaderProps) {
  const { user } = useAuth();
  const primeiroNome = user?.usuario.nome.split(' ')[0] ?? 'Usuário';

  return (
    <header className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{titulo ?? `Olá, ${primeiroNome}!`}</h1>
        <p className="text-slate-500 mt-1">{subtitulo}</p>
      </div>

      <div className="flex items-center gap-3 text-slate-600" title={user?.usuario.email}>
        <span className="hidden md:block text-sm">{user?.usuario.cargo}</span>
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600" aria-hidden="true">
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
