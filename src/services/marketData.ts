import type { MarketAsset } from '../types'

const ENDPOINT =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&ids=bitcoin,ethereum,solana&price_change_percentage=24h'

interface CoinGeckoAsset {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number | null
}

export async function getPublicMarketData(signal?: AbortSignal): Promise<MarketAsset[]> {
  const response = await fetch(ENDPOINT, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Marktdaten konnten nicht geladen werden (HTTP ${response.status}).`)
  }
  const data = (await response.json()) as CoinGeckoAsset[]
  const updatedAt = new Date().toISOString()
  return data.map((asset) => ({
    id: asset.id,
    symbol: asset.symbol.toUpperCase(),
    name: asset.name,
    price: asset.current_price,
    change24h: asset.price_change_percentage_24h ?? 0,
    currency: 'EUR',
    updatedAt,
  }))
}
