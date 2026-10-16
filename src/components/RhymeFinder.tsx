import { useEffect, useState } from 'react'
import { Type } from 'lucide-react'
import { EmptyState, InfoCard } from './ui'
import { getRelatedWords, getRhymes } from '../services/rhymes'
import type { WordResult } from '../services/rhymes'

export function RhymeFinder() {
  const [word, setWord] = useState('')
  const [mode, setMode] = useState<'rhyme' | 'related'>('rhyme')
  const [results, setResults] = useState<WordResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = word.trim()
    if (!trimmed) {
      setStatus('idle')
      setResults([])
      return
    }
    let cancelled = false
    setStatus('loading')
    setError(null)
    const timer = window.setTimeout(() => {
      const fetcher = mode === 'rhyme' ? getRhymes : getRelatedWords
      fetcher(trimmed)
        .then((data) => { if (!cancelled) { setResults(data); setStatus('ready') } })
        .catch((cause) => {
          if (cancelled) return
          setStatus('error')
          setError(cause instanceof Error ? cause.message : 'Unbekannter Fehler beim Abruf.')
        })
    }, 350)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [word, mode])

  return (
    <InfoCard title="Reim- & Wortfinder" className="span-6">
      <div className="rhyme-controls">
        <input value={word} onChange={(event) => setWord(event.target.value)} placeholder="Wort eingeben …" aria-label="Wort für Reime oder verwandte Begriffe" />
        <div className="rhyme-mode-toggle" role="radiogroup" aria-label="Suchmodus">
          <button type="button" role="radio" aria-checked={mode === 'rhyme'} className={mode === 'rhyme' ? 'is-active' : ''} onClick={() => setMode('rhyme')}>Reime</button>
          <button type="button" role="radio" aria-checked={mode === 'related'} className={mode === 'related' ? 'is-active' : ''} onClick={() => setMode('related')}>Verwandt</button>
        </div>
      </div>
      {status === 'idle' && <EmptyState title="Noch keine Suche" icon={<Type size={20} />}>Tippe ein Wort – über die kostenlose Datamuse-API, ohne Login oder Key.</EmptyState>}
      {status === 'loading' && <p className="small-status">Suche läuft …</p>}
      {status === 'error' && <p className="small-status rhyme-error">{error}</p>}
      {status === 'ready' && (results.length ? (
        <div className="rhyme-results">
          {results.map((entry) => <button key={entry.word} className="rhyme-chip" onClick={() => setWord(entry.word)}>{entry.word}</button>)}
        </div>
      ) : <p className="small-status">Keine Treffer für „{word.trim()}“ – die Datenbank ist Englisch-basiert, deutsche Wörter liefern oft wenige oder keine Ergebnisse.</p>)}
      <p className="small-status rhyme-source">Quelle: api.datamuse.com (öffentlich) · funktioniert am besten für englische Wörter und Slang-Begriffe, nicht für deutsche Grammatikformen.</p>
    </InfoCard>
  )
}
