import { useCallback, useEffect, useState } from 'react'
import { getFearGreedIndex } from '../services/fearGreed'
import type { FearGreedSnapshot } from '../services/fearGreed'

export function useFearGreedIndex() {
  const [data, setData] = useState<FearGreedSnapshot | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const snapshot = await getFearGreedIndex()
      setData(snapshot)
      setStatus('ready')
    } catch (cause) {
      setStatus('error')
      setData(null)
      setError(cause instanceof Error ? cause.message : 'Unbekannter Fehler beim Abruf.')
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  return { data, status, error, refresh }
}
