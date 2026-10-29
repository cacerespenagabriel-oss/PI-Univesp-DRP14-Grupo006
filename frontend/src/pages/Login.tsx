import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { CalendarDays, Eye, EyeOff, LockKeyhole, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function Login() {
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [email, setEmail] = useState('admin@frequencia.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!/^\d{6}$/.test(password)) {
      setError('A senha deve conter exatamente 6 dígitos.')
      return
    }

    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        setError('E-mail ou senha incorretos.')
      } else if (axios.isAxiosError(requestError) && !requestError.response) {
        setError('Não foi possível conectar ao servidor.')
      } else {
        setError('Não foi possível realizar o acesso.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4 py-10 transition-colors">
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed right-5 top-5 w-11 h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-sm"
        aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <section className="w-full max-w-md rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-7 sm:p-9">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 text-white p-2 rounded-md"><CalendarDays size={24} /></div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">Frequência+</span>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Acessar o sistema</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Entre com suas credenciais para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">E-mail</label>
            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Senha de 6 dígitos</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 text-slate-400" size={20} />
              <input id="password" type={showPassword ? 'text' : 'password'} inputMode="numeric" maxLength={6} value={password} onChange={(event) => setPassword(event.target.value.replace(/\D/g, '').slice(0, 6))} required autoComplete="current-password" className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-10 pr-11 text-slate-900 dark:text-white tracking-widest outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-2 top-1.5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}

          <button type="submit" disabled={loading} className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold transition-colors">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}
