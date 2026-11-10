import { useEffect, useState } from 'react'
import { CalendarDays, Home, Users, BrainCircuit, Accessibility, User, LogOut, Moon, Sun } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { usePage, type Pagina } from '../hooks/usePage'

const MENU: { pagina: Pagina; rotulo: string; icone: typeof Home }[] = [
  { pagina: 'inicio', rotulo: 'Início', icone: Home },
  { pagina: 'alunos', rotulo: 'Alunos', icone: Users },
  { pagina: 'previsoes', rotulo: 'Previsões (IA)', icone: BrainCircuit },
]

const TAMANHOS_FONTE = [14, 16, 18]
const CHAVE_FONTE = 'frequencia-plus-fonte'

function lerFonte(): number {
  try {
    const salvo = Number(localStorage.getItem(CHAVE_FONTE))
    return TAMANHOS_FONTE.includes(salvo) ? salvo : 16
  } catch {
    return 16
  }
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const paginaAtual = usePage()
  const [fonte, setFonte] = useState(lerFonte)

  useEffect(() => {
    document.documentElement.style.fontSize = `${fonte}px`
    try { localStorage.setItem(CHAVE_FONTE, String(fonte)) } catch { /* sem armazenamento */ }
  }, [fonte])

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
      <nav className="flex-1 px-4 py-2 space-y-2" aria-label="Menu principal">
        {MENU.map(({ pagina, rotulo, icone: Icone }) => (
          <a
            key={pagina}
            href={`#/${pagina}`}
            aria-current={paginaAtual === pagina ? 'page' : undefined}
            className={clsx(
              'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
              paginaAtual === pagina ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800',
            )}
          >
            <Icone size={20} />
            {rotulo}
          </a>
        ))}
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
            {TAMANHOS_FONTE.map((tamanho, i) => (
              <button
                key={tamanho}
                type="button"
                onClick={() => setFonte(tamanho)}
                aria-label={['Fonte pequena', 'Fonte normal', 'Fonte grande'][i]}
                aria-pressed={fonte === tamanho}
                className={clsx('hover:text-white font-semibold', ['text-sm', 'text-base', 'text-lg'][i], fonte === tamanho && 'text-white underline underline-offset-4')}
              >
                A
              </button>
            ))}
            <div className="w-px h-4 bg-slate-600 mx-1"></div>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              className="hover:text-white w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Usuário Dropdown (Simulado) */}
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between gap-2 text-slate-300 px-2 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <User size={20} />
              <span className="font-medium truncate">{user?.usuario.nome ?? 'Usuário'}</span>
            </div>
            <button type="button" onClick={logout} aria-label="Sair" title="Sair" className="p-2 hover:text-white hover:bg-slate-800 rounded-lg">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
