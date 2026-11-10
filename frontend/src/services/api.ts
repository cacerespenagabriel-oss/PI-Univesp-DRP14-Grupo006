import axios from 'axios'

// Endereço do back-end. Em produção, defina VITE_API_URL nas variáveis de ambiente da Vercel.
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:8000'
export const SESSION_KEY = 'frequencia-plus-session'
export const SESSION_EXPIRED_EVENT = 'frequencia-plus:sessao-expirada'

export const api = axios.create({ baseURL: API_URL })

// Envia o token de login em todas as requisições.
api.interceptors.request.use((config) => {
  const saved = localStorage.getItem(SESSION_KEY)
  if (saved) {
    try {
      const { token } = JSON.parse(saved) as { token?: string }
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
  }
  return config
})

// Se o token expirar, avisa o AuthContext para voltar à tela de login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export function mensagemDeErro(error: unknown, padrao = 'Não foi possível carregar os dados.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Não foi possível conectar ao servidor.'
    const detail = (error.response.data as { detail?: unknown })?.detail
    if (typeof detail === 'string') return detail
  }
  return padrao
}
