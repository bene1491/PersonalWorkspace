import { useCallback, useEffect, useState } from 'react'
import { getNextPublicHoliday } from '../services/holidays'
import type { PublicHoliday } from '../services/holidays'

export function useNextHoliday(countryCode: string) {
  const [data, setData] = useState<PublicHoliday | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const holiday = await getNextPublicHoliday(countryCode)
      setData(holiday)
      setStatus('ready')
    } catch (cause) {
      setStatus('error')
      setData(null)
      setError(cause instanceof Error ? cause.message : 'Unbekannter Fehler beim Abruf.')
    }
  }, [countryCode])

  useEffect(() => { void refresh() }, [refresh])
  return { data, status, error, refresh }
}
