import type { WeatherSnapshot } from '../types'

const GEOCODE_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

interface GeocodeResult {
  name: string
  country?: string
  latitude: number
  longitude: number
}

interface ForecastResponse {
  current?: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    is_day: number
  }
}

async function geocodeCity(city: string, signal?: AbortSignal): Promise<GeocodeResult> {
  const url = `${GEOCODE_ENDPOINT}?name=${encodeURIComponent(city)}&count=1&language=de&format=json`
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Ortssuche fehlgeschlagen (HTTP ${response.status}).`)
  }
  const payload = (await response.json()) as { results?: GeocodeResult[] }
  const match = payload.results?.[0]
  if (!match) {
    throw new Error(`Kein Ort namens „${city}“ gefunden.`)
  }
  return match
}

export async function getPublicWeather(city: string, signal?: AbortSignal): Promise<WeatherSnapshot> {
  const location = await geocodeCity(city, signal)
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    timezone: 'auto',
  })
  const response = await fetch(`${FORECAST_ENDPOINT}?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Wetterdaten konnten nicht geladen werden (HTTP ${response.status}).`)
  }
  const payload = (await response.json()) as ForecastResponse
  const current = payload.current
  if (!current) {
    throw new Error('Wetterdienst hat keine aktuellen Werte geliefert.')
  }
  return {
    city: location.name,
    country: location.country,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
    updatedAt: new Date().toISOString(),
  }
}

export function describeWeatherCode(code: number): string {
  if (code === 0) return 'Klarer Himmel'
  if (code <= 2) return 'Überwiegend klar'
  if (code === 3) return 'Bedeckt'
  if (code <= 48) return 'Nebel'
  if (code <= 57) return 'Niesel'
  if (code <= 67) return 'Regen'
  if (code <= 77) return 'Schneefall'
  if (code <= 82) return 'Regenschauer'
  if (code <= 86) return 'Schneeschauer'
  if (code <= 99) return 'Gewitter'
  return 'Unbekannt'
}
