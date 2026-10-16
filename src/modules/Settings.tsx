import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { Check, Download, FileLock2, FolderLock, ShieldCheck, Upload } from 'lucide-react'
import { InfoCard, Pill, SectionHeading } from '../components/ui'
import { useToast } from '../components/ToastContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { downloadBackup, isBackupFile, restoreBackup } from '../services/backup'
import type { AccentId } from '../types'

const ACCENT_OPTIONS: { id: AccentId; label: string; swatch: string }[] = [
  { id: 'lavender', label: 'Lavendel', swatch: '#8fa9fc' },
  { id: 'violet', label: 'Violett', swatch: '#ab8cff' },
  { id: 'emerald', label: 'Smaragd', swatch: '#67cf9e' },
  { id: 'coral', label: 'Koralle', swatch: '#ff9478' },
  { id: 'rose', label: 'Rosé', swatch: '#ff8fb3' },
]

interface SettingsProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  location: string
  onLocationChange: (value: string) => void
  accent: AccentId
  onAccentChange: (value: AccentId) => void
}

export function Settings({ theme, onToggleTheme, location, onLocationChange, accent, onAccentChange }: SettingsProps) {
  const [compact, setCompact] = useLocalStorage<boolean>('personal-workspace.compact-mode.v1', false)
  const [locationDraft, setLocationDraft] = useState(location)
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  useMemo(() => { document.documentElement.dataset.density = compact ? 'compact' : 'comfortable' }, [compact])

  function submitLocation(event: React.FormEvent) {
    event.preventDefault()
    const cleaned = locationDraft.trim()
    if (cleaned) onLocationChange(cleaned)
  }

  function handleExport() {
    downloadBackup()
    showToast('Backup wurde heruntergeladen')
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!isBackupFile(parsed)) {
        showToast('Diese Datei ist kein gültiges Personal-Workspace-Backup.')
        return
      }
      const confirmed = window.confirm(
        `Backup vom ${new Date(parsed.exportedAt).toLocaleString('de-DE')} importieren? Das überschreibt alle aktuell in diesem Browser gespeicherten Workspace-Daten.`,
      )
      if (!confirmed) return
      restoreBackup(parsed)
      window.location.reload()
    } catch {
      showToast('Datei konnte nicht gelesen werden – ist es eine gültige JSON-Datei?')
    }
  }

  return <>
    <SectionHeading eyebrow="Kontrolle & Transparenz" title="Einstellungen & Verbindungen" description="Lokale Darstellung, Datenstatus und feste Sicherheitsgrenzen." />
    <div className="settings-layout">
      <div>
        <InfoCard title="Darstellung">
          <div className="settings-row"><div><strong>Erscheinungsbild</strong><small>{theme === 'dark' ? 'Dunkelmodus ist aktiv' : 'Hellmodus ist aktiv'}</small></div><button className="button button-ghost" onClick={onToggleTheme}>{theme === 'dark' ? 'Hellmodus nutzen' : 'Dunkelmodus nutzen'}</button></div>
          <div className="settings-row"><div><strong>Kompakte Dichte</strong><small>Reduziert vertikale Abstände in Tabellen und Listen.</small></div><button className={`toggle ${compact ? 'on' : ''}`} role="switch" aria-checked={compact} onClick={() => setCompact(!compact)}><span /></button></div>
          <div className="settings-row accent-row">
            <div><strong>Akzentfarbe</strong><small>Persönliche Farbe für Buttons, Links und Hervorhebungen.</small></div>
            <div className="accent-swatches" role="radiogroup" aria-label="Akzentfarbe wählen">
              {ACCENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={accent === option.id}
                  aria-label={option.label}
                  className={`accent-swatch ${accent === option.id ? 'is-active' : ''}`}
                  style={{ '--swatch-color': option.swatch } as CSSProperties}
                  onClick={() => onAccentChange(option.id)}
                >
                  {accent === option.id && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>
          <form className="settings-row location-form" onSubmit={submitLocation}><div><strong>Ort für Wetterdaten</strong><small>Wird für den öffentlichen Open-Meteo-Abruf im Command Center verwendet.</small></div><div className="location-inputs"><input value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} placeholder="z. B. Hamburg" aria-label="Ort für Wetterdaten" /><button className="button button-ghost" type="submit">Übernehmen</button></div></form>
        </InfoCard>
        <InfoCard title="Backup" className="lower-grid">
          <div className="settings-row">
            <div><strong>Workspace-Daten exportieren</strong><small>Lädt alle lokalen Daten (Aufgaben, Watchlist, Karteikarten, …) als JSON-Datei herunter.</small></div>
            <button className="button button-ghost" onClick={handleExport}><Download size={15} /> Exportieren</button>
          </div>
          <div className="settings-row">
            <div><strong>Backup wiederherstellen</strong><small>Überschreibt alle aktuell gespeicherten Workspace-Daten in diesem Browser.</small></div>
            <button className="button button-ghost" onClick={handleImportClick}><Upload size={15} /> Importieren</button>
            <input ref={fileInputRef} type="file" accept="application/json" className="sr-only-input" onChange={(event) => void handleImportFile(event)} aria-label="Backup-Datei auswählen" />
          </div>
        </InfoCard>
        <InfoCard title="Datenquellen" className="lower-grid">
          <div className="source-list">
            <div><span className="connection-dot ready" /><span><strong>CoinGecko (öffentlich)</strong><small>Optionaler, browserseitiger Kursabruf für Kryptowährungen.</small></span><Pill tone="positive">Verfügbar</Pill></div>
            <div><span className="connection-dot ready" /><span><strong>Open-Meteo (öffentlich)</strong><small>Optionaler, browserseitiger Wetterabruf für „{location}“.</small></span><Pill tone="positive">Verfügbar</Pill></div>
            <div><span className="connection-dot ready" /><span><strong>Frankfurter.app (öffentlich)</strong><small>EZB-Wechselkurse für den Währungsrechner.</small></span><Pill tone="positive">Verfügbar</Pill></div>
            <div><span className="connection-dot ready" /><span><strong>date.nager.at (öffentlich)</strong><small>Gesetzliche Feiertage für Deutschland.</small></span><Pill tone="positive">Verfügbar</Pill></div>
            <div><span className="connection-dot ready" /><span><strong>Alternative.me (öffentlich)</strong><small>Angst-&-Gier-Index für den Kryptomarkt.</small></span><Pill tone="positive">Verfügbar</Pill></div>
            <div><span className="connection-dot ready" /><span><strong>Datamuse (öffentlich)</strong><small>Reime und verwandte Wörter fürs Songwriting.</small></span><Pill tone="positive">Verfügbar</Pill></div>
            <div><span className="connection-dot" /><span><strong>Dateien & Dokumente</strong><small>Keine lokalen Verzeichnisse freigegeben.</small></span><Pill>Nicht verbunden</Pill></div>
            <div><span className="connection-dot" /><span><strong>KI-Anbieter</strong><small>Keine API-Keys und keine Gespräche übertragen.</small></span><Pill>Nicht verbunden</Pill></div>
          </div>
        </InfoCard>
      </div>
      <div>
        <InfoCard title="Datenschutz">
          <div className="privacy-list">
            <div><ShieldCheck size={18} /><p><strong>Workspace-Daten</strong> werden im LocalStorage dieses Browsers gespeichert.</p></div>
            <div><FolderLock size={18} /><p><strong>Dateisystem</strong> wird nicht gescannt oder bearbeitet.</p></div>
            <div><FileLock2 size={18} /><p><strong>Bachelorarbeit</strong> bleibt als feste Sperrzone von jeder Integration ausgeschlossen.</p></div>
          </div>
        </InfoCard>
        <InfoCard title="Anwendung" className="lower-grid">
          <div className="version-row"><span>Version</span><strong>Personal Workspace v0.1</strong></div>
          <div className="version-row"><span>Speicherort</span><strong>Browser LocalStorage</strong></div>
          <div className="version-row"><span>Netzwerk</span><strong>Nur optionale, öffentliche Datenabrufe</strong></div>
        </InfoCard>
      </div>
    </div>
  </>
}
