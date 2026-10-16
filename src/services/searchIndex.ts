import type { SearchItem } from '../types'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/**
 * Reads directly from localStorage rather than a shared context, matching the
 * project's rule that only tasks are a global data domain (see ARCHITECTURE.md).
 * Data is read fresh each time the command palette opens.
 */
export function buildLocalSearchItems(): SearchItem[] {
  const items: SearchItem[] = []

  for (const prompt of readJSON<{ id: string; title: string; context: string }[]>('personal-workspace.prompts.v1', [])) {
    items.push({ id: `prompt-${prompt.id}`, title: prompt.title, subtitle: `Prompt · ${prompt.context}`, area: 'ai-lab', href: '/ai-lab' })
  }

  for (const song of readJSON<{ id: string; title: string; status: string }[]>('personal-workspace.music-entries.v1', [])) {
    items.push({ id: `song-${song.id}`, title: song.title, subtitle: `Songidee · ${song.status}`, area: 'music', href: '/music-studio' })
  }

  for (const entry of readJSON<{ id: string; title: string }[]>('personal-workspace.investment-journal.v1', [])) {
    items.push({ id: `journal-${entry.id}`, title: entry.title, subtitle: 'Investment-Journal', area: 'finance', href: '/finanzen' })
  }

  for (const card of readJSON<{ id: string; front: string }[]>('personal-workspace.flashcards.v1', [])) {
    items.push({ id: `flashcard-${card.id}`, title: card.front, subtitle: 'Karteikarte · Uni & Studium', area: 'study', href: '/studium' })
  }

  for (const ticker of readJSON<string[]>('personal-workspace.watchlist.v1', [])) {
    items.push({ id: `watchlist-${ticker}`, title: ticker, subtitle: 'Watchlist-Ticker', area: 'finance', href: '/finanzen' })
  }

  return items
}
