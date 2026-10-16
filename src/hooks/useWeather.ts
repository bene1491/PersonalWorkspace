import { useCallback, useEffect, useState } from 'react'
import { getPublicWeather } from '../services/weather'
import type { WeatherSnapshot } from '../types'

export function useWeather(city: string) {
  const [data, setData] = useState<WeatherSnapshot | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const snapshot = await getPublicWeather(city)
      setData(snapshot)
      setStatus('ready')
    } catch (cause) {
      setStatus('error')
      setData(null)
      setError(cause instanceof Error ? cause.message : 'Unbekannter Fehler beim Abruf.')
    }
  }, [city])

  useEffect(() => { void refresh() }, [refresh])
  return { data, status, error, refresh }
}
