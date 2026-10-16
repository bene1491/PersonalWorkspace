import { RefreshCw } from 'lucide-react'
import { InfoCard, Pill } from './ui'
import { useFearGreedIndex } from '../hooks/useFearGreedIndex'
import { translateClassification } from '../services/fearGreed'

const timestamp = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' })

export function FearGreedWidget() {
  const { data, status, error, refresh } = useFearGreedIndex()

  return (
    <InfoCard className="portfolio-state fng-card">
      <div className="market-card-head">
        <Pill tone={status === 'ready' ? 'positive' : status === 'error' ? 'warning' : 'neutral'}>{status === 'ready' ? 'Live' : status === 'error' ? 'Nicht verfügbar' : 'Lädt'}</Pill>
        <button className="mini-icon" onClick={() => void refresh()} aria-label="Angst-&-Gier-Index aktualisieren"><RefreshCw size={14} /></button>
      </div>
      <h2>Angst & Gier</h2>
      {status === 'ready' && data && <>
        <div className="fng-value">{data.value}</div>
        <div className="fng-bar"><span style={{ left: `${Math.min(100, Math.max(0, data.value))}%` }} /></div>
        <p>{translateClassification(data.classification)} · {timestamp.format(new Date(data.updatedAt))}</p>
      </>}
      {status === 'loading' && <p className="small-status">Index wird abgerufen …</p>}
      {status === 'error' && <p className="small-status">{error}</p>}
    </InfoCard>
  )
}
