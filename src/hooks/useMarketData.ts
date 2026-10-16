import { useCallback, useEffect, useState } from 'react'
import { getPublicMarketData } from '../services/marketData'
import type { MarketAsset } from '../types'

export function useMarketData() {
  const [data, setData] = useState<MarketAsset[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const markets = await getPublicMarketData()
      setData(markets)
      setStatus('ready')
    } catch (cause) {
      setStatus('error')
      setData([])
      setError(cause instanceof Error ? cause.message : 'Unbekannter Fehler beim Abruf.')
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])
  return { data, status, error, refresh }
}
