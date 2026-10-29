import { createContext, useContext, useState, type ReactNode } from 'react'
import axios from 'axios'

interface Usuario {
  nome: string
  email: string
  cargo: string
}

interface LoginResponse {
  token: string
  usuario: Usuario
}

interface AuthContextValue {
  user: LoginResponse | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const SESSION_KEY = 'frequencia-plus-session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(() => {
    const savedSession = localStorage.getItem(SESSION_KEY)
    return savedSession ? JSON.parse(savedSession) as LoginResponse : null
  })

  async function login(email: string, password: string) {
    const response = await axios.post<LoginResponse>('http://localhost:8000/auth/login', {
      email,
      password,
    })

    localStorage.setItem(SESSION_KEY, JSON.stringify(response.data))
    setUser(response.data)
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
