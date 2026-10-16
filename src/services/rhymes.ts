export interface WordResult {
  word: string
  score?: number
}

const ENDPOINT = 'https://api.datamuse.com/words'

export async function getRhymes(word: string, signal?: AbortSignal): Promise<WordResult[]> {
  const params = new URLSearchParams({ rel_rhy: word, max: '24' })
  const response = await fetch(`${ENDPOINT}?${params.toString()}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Reime konnten nicht geladen werden (HTTP ${response.status}).`)
  }
  return (await response.json()) as WordResult[]
}

export async function getRelatedWords(word: string, signal?: AbortSignal): Promise<WordResult[]> {
  const params = new URLSearchParams({ ml: word, max: '24' })
  const response = await fetch(`${ENDPOINT}?${params.toString()}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new Error(`Verwandte Wörter konnten nicht geladen werden (HTTP ${response.status}).`)
  }
  return (await response.json()) as WordResult[]
}
