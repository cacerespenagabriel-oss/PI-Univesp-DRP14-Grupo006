import { useEffect, useState } from 'react'

export type Pagina = 'inicio' | 'alunos' | 'previsoes'
const PAGINAS: Pagina[] = ['inicio', 'alunos', 'previsoes']

function lerHash(): Pagina {
  const hash = window.location.hash.replace('#/', '').replace('#', '') as Pagina
  return PAGINAS.includes(hash) ? hash : 'inicio'
}

/** Navegação simples pelo "#" da URL (ex.: /#/alunos), sem precisar de biblioteca de rotas. */
export function usePage() {
  const [pagina, setPagina] = useState<Pagina>(lerHash)

  useEffect(() => {
    const aoMudar = () => setPagina(lerHash())
    window.addEventListener('hashchange', aoMudar)
    return () => window.removeEventListener('hashchange', aoMudar)
  }, [])

  return pagina
}
