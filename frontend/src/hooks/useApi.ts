import { useCallback, useEffect, useState } from 'react'
import { api, mensagemDeErro } from '../services/api'

/** Busca dados da API (GET) e devolve { data, loading, error, recarregar }. */
export function useApi<T>(url: string | null, params?: Record<string, unknown>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(Boolean(url))
  const [error, setError] = useState('')
  const [versao, setVersao] = useState(0)
  const chaveParams = JSON.stringify(params ?? {})

  useEffect(() => {
    if (!url) return
    let ativo = true
    setLoading(true)
    setError('')
    api
      .get<T>(url, { params: JSON.parse(chaveParams) })
      .then((response) => { if (ativo) setData(response.data) })
      .catch((erro) => { if (ativo) setError(mensagemDeErro(erro)) })
      .finally(() => { if (ativo) setLoading(false) })
    return () => { ativo = false }
  }, [url, chaveParams, versao])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])
  return { data, loading, error, recarregar }
}
