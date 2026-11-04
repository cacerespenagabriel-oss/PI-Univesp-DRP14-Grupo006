import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, SESSION_EXPIRED_EVENT, SESSION_KEY } from '../services/api'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse | null>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY)
      return savedSession ? JSON.parse(savedSession) as LoginResponse : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const aoExpirar = () => logout()
    window.addEventListener(SESSION_EXPIRED_EVENT, aoExpirar)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, aoExpirar)
  }, [])

  async function login(email: string, password: string) {
    const response = await api.post<LoginResponse>('/auth/login', {
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
