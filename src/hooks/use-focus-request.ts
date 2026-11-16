import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useRef, useState } from 'react'
import { ApiError } from '../services/api-client'

/**
 * Executa `fetcher` sempre que a tela ganha foco ou `deps` mudam, descartando
 * respostas obsoletas. Mantém o dado anterior enquanto recarrega.
 */
export function useFocusRequest<T>(fetcher: () => Promise<T>, deps: React.DependencyList) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const counter = useRef(0)

  const run = useCallback(async () => {
    const id = ++counter.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      if (id === counter.current) setData(result)
    } catch (e) {
      if (id === counter.current) {
        setError(e instanceof ApiError ? e.message : 'Erro inesperado. Tente novamente.')
      }
    } finally {
      if (id === counter.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useFocusEffect(
    useCallback(() => {
      void run()
    }, [run]),
  )

  return { data, loading, error, reload: run }
}
