import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Alunos } from './pages/Alunos'
import { Previsoes } from './pages/Previsoes'
import { useAuth } from './context/AuthContext'
import { usePage } from './hooks/usePage'

function App() {
  const { isAuthenticated } = useAuth()
  const pagina = usePage()

  if (!isAuthenticated) return <Login />
  if (pagina === 'alunos') return <Alunos />
  if (pagina === 'previsoes') return <Previsoes />
  return <Dashboard />
}

export default App
