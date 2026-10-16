export interface CurrencyConversion {
  amount: number
  from: string
  to: string
  result: number
  rate: number
  date: string
}

const LATEST_ENDPOINT = 'https://api.frankfurter.app/latest'
const CURRENCIES_ENDPOINT = 'https://api.frankfurter.app/currencies'

export async function getAvailableCurrencies(signal?: AbortSignal): Promise<Record<string, string>> {
  const response = await fetch(CURRENCIES_ENDPOINT, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Währungsliste konnte nicht geladen werden (HTTP ${response.status}).`)
  }
  return (await response.json()) as Record<string, string>
}

export async function convertCurrency(amount: number, from: string, to: string, signal?: AbortSignal): Promise<CurrencyConversion> {
  if (from === to) {
    return { amount, from, to, result: amount, rate: 1, date: new Date().toISOString().slice(0, 10) }
  }
  const params = new URLSearchParams({ amount: String(amount), from, to })
  const response = await fetch(`${LATEST_ENDPOINT}?${params.toString()}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Wechselkurs konnte nicht geladen werden (HTTP ${response.status}).`)
  }
  const payload = (await response.json()) as { date: string; rates: Record<string, number> }
  const result = payload.rates[to]
  if (result === undefined) {
    throw new Error(`Kein Kurs für ${to} verfügbar.`)
  }
  return { amount, from, to, result, rate: amount > 0 ? result / amount : 0, date: payload.date }
}
