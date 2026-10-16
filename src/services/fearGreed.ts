export interface FearGreedSnapshot {
  value: number
  classification: string
  updatedAt: string
}

const ENDPOINT = 'https://api.alternative.me/fng/'

interface FearGreedResponse {
  data?: { value: string; value_classification: string; timestamp: string }[]
}

export async function getFearGreedIndex(signal?: AbortSignal): Promise<FearGreedSnapshot> {
  const response = await fetch(ENDPOINT, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Angst-&-Gier-Index konnte nicht geladen werden (HTTP ${response.status}).`)
  }
  const payload = (await response.json()) as FearGreedResponse
  const entry = payload.data?.[0]
  if (!entry) {
    throw new Error('Keine Indexdaten erhalten.')
  }
  return {
    value: Number(entry.value),
    classification: entry.value_classification,
    updatedAt: new Date(Number(entry.timestamp) * 1000).toISOString(),
  }
}

const CLASSIFICATION_LABELS: Record<string, string> = {
  'Extreme Fear': 'Extreme Angst',
  Fear: 'Angst',
  Neutral: 'Neutral',
  Greed: 'Gier',
  'Extreme Greed': 'Extreme Gier',
}

export function translateClassification(classification: string): string {
  return CLASSIFICATION_LABELS[classification] ?? classification
}
