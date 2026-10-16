import { useEffect, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { InfoCard } from './ui'
import { convertCurrency, getAvailableCurrencies } from '../services/currency'
import type { CurrencyConversion } from '../services/currency'

const FALLBACK_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'CAD', 'AUD', 'SEK', 'NOK', 'PLN']
const resultFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })
const rateFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 4 })
const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' })

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('EUR')
  const [to, setTo] = useState('USD')
  const [currencyCodes, setCurrencyCodes] = useState<string[]>(FALLBACK_CURRENCIES)
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAvailableCurrencies()
      .then((list) => { if (!cancelled) setCurrencyCodes(Object.keys(list).sort()) })
      .catch(() => { /* keep fallback list */ })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount < 0) return
    let cancelled = false
    setStatus('loading')
    setError(null)
    const timer = window.setTimeout(() => {
      convertCurrency(numericAmount, from, to)
        .then((result) => { if (!cancelled) { setConversion(result); setStatus('ready') } })
        .catch((cause) => {
          if (cancelled) return
          setStatus('error')
          setError(cause instanceof Error ? cause.message : 'Unbekannter Fehler beim Abruf.')
        })
    }, 350)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [amount, from, to])

  function swap() {
    setFrom(to)
    setTo(from)
  }

  return (
    <InfoCard title="Währungsrechner">
      <div className="converter">
        <div className="converter-row">
          <input type="number" min={0} inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} aria-label="Betrag" />
          <select value={from} onChange={(event) => setFrom(event.target.value)} aria-label="Ausgangswährung">
            {currencyCodes.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>
        <button className="converter-swap" onClick={swap} aria-label="Währungen tauschen"><ArrowLeftRight size={15} /></button>
        <div className="converter-row">
          <output className="converter-result">{status === 'ready' && conversion ? resultFormat.format(conversion.result) : '—'}</output>
          <select value={to} onChange={(event) => setTo(event.target.value)} aria-label="Zielwährung">
            {currencyCodes.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>
        {status === 'error' && <p className="small-status converter-error">{error}</p>}
        {status === 'ready' && conversion && <p className="small-status">1 {from} = {rateFormat.format(conversion.rate)} {to} · EZB-Referenzkurs vom {dateFormat.format(new Date(conversion.date))} · Quelle: frankfurter.app</p>}
      </div>
    </InfoCard>
  )
}
