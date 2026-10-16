import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock3, Droplets, Plus, RefreshCw, ShieldCheck, Sparkles, Wind } from 'lucide-react'
import { useWorkspace } from '../components/WorkspaceContext'
import { InfoCard, Notice, Pill, SectionHeading } from '../components/ui'
import { useMarketData } from '../hooks/useMarketData'
import { useWeather } from '../hooks/useWeather'
import { describeWeatherCode } from '../services/weather'

const germanDate = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

export function Dashboard({ location }: { location: string }) {
  const { tasks, updateTask } = useWorkspace()
  const { data, status, error, refresh } = useMarketData()
  const { data: weather, status: weatherStatus, error: weatherError, refresh: refreshWeather } = useWeather(location)
  const openTasks = tasks.filter((task) => task.status !== 'done')
  const completed = tasks.filter((task) => task.status === 'done').length

  return (
    <>
      <SectionHeading
        eyebrow="Dein persönlicher Überblick"
        title={`Guten Tag`}
        description={`${germanDate.format(new Date())} · Alles an einem sicheren, lokalen Ort.`}
        action={<Link to="/aufgaben" className="button button-primary"><Plus size={16} /> Aufgabe anlegen</Link>}
      />
      <div className="dashboard-grid">
        <InfoCard className="briefing-card">
          <div className="card-kicker"><Sparkles size={16} /><span>Heutiges Briefing</span><Pill tone="neutral">Vorbereitet</Pill></div>
          <h2>Ein ruhiger Start in deinen Tag.</h2>
          <p>Dein Workspace ist lokal eingerichtet. Füge Aufgaben, Notizen und Einträge hinzu, wenn du bereit bist.</p>
          <div className="briefing-meta"><span><CheckCircle2 size={15} /> {completed} erledigt</span><span><Clock3 size={15} /> {openTasks.length} offen</span></div>
        </InfoCard>
        <InfoCard className="security-card">
          <div className="security-icon"><ShieldCheck size={21} /></div>
          <div><Pill tone="positive">Geschützt</Pill><h3>Lokaler Modus aktiv</h3><p>Keine Ordnerfreigaben, keine externen KI-Dienste und kein automatischer Dateizugriff.</p></div>
          <Link to="/einstellungen" className="subtle-link">Details <ArrowRight size={14} /></Link>
        </InfoCard>
        <InfoCard className="weather-card">
          <div className="weather-head"><Pill tone={weatherStatus === 'ready' ? 'positive' : weatherStatus === 'error' ? 'warning' : 'neutral'}>{weatherStatus === 'ready' ? 'Öffentliche Daten' : weatherStatus === 'error' ? 'Nicht verfügbar' : 'Lädt'}</Pill><button className="mini-icon" aria-label="Wetter aktualisieren" onClick={() => void refreshWeather()}><RefreshCw size={14} /></button></div>
          {weatherStatus === 'ready' && weather && <>
            <div className="weather-body">
              <span className="weather-temp">{Math.round(weather.temperature)}°</span>
              <div><strong>{describeWeatherCode(weather.weatherCode)}</strong><small>{weather.city}{weather.country ? `, ${weather.country}` : ''}</small></div>
            </div>
            <div className="weather-meta"><span><Droplets size={12} /> {Math.round(weather.humidity)} %</span><span><Wind size={12} /> {Math.round(weather.windSpeed)} km/h</span><span>Gefühlt {Math.round(weather.apparentTemperature)}°</span></div>
          </>}
          {weatherStatus === 'loading' && <p className="small-status">Wetterdaten für „{location}“ werden abgerufen …</p>}
          {weatherStatus === 'error' && <p className="small-status">{weatherError}</p>}
          <Link to="/einstellungen" className="subtle-link weather-source-link">Quelle: Open-Meteo · Ort ändern <ArrowRight size={14} /></Link>
        </InfoCard>
      </div>
      <div className="content-grid dashboard-content-grid">
        <InfoCard title="Offene Aufgaben" className="span-7">
          {openTasks.length ? <div className="simple-list">
            {openTasks.slice(0, 4).map((task) => <div className="task-row" key={task.id}>
              <button className="check-button" aria-label={`${task.title} erledigen`} onClick={() => updateTask(task.id, { status: 'done' })} />
              <div className="task-copy"><strong>{task.title}</strong><small>{task.area === 'tasks' ? 'Persönlich' : task.area} · {task.priority === 'high' ? 'Hohe Priorität' : 'Geplant'}</small></div>
              <Pill tone={task.priority === 'high' ? 'warning' : 'neutral'}>{task.priority === 'high' ? 'Hoch' : 'Offen'}</Pill>
            </div>)}
          </div> : <div className="compact-empty">Keine offenen Aufgaben. Ein guter Moment, um vorauszuplanen.</div>}
          <Link to="/aufgaben" className="text-link">Alle Aufgaben öffnen <ArrowRight size={15} /></Link>
        </InfoCard>
        <InfoCard title="Marktschnappschuss" className="span-5">
          <div className="market-card-head"><Pill tone={status === 'ready' ? 'positive' : status === 'error' ? 'warning' : 'neutral'}>{status === 'ready' ? 'Öffentliche Daten' : status === 'error' ? 'Nicht verfügbar' : 'Lädt'}</Pill><button className="mini-icon" aria-label="Marktdaten aktualisieren" onClick={() => void refresh()}><RefreshCw size={14} /></button></div>
          {status === 'ready' ? <div className="snapshot-list">{data.slice(0, 3).map((asset) => <div key={asset.id} className="snapshot-row"><span><strong>{asset.symbol}</strong><small>{asset.name}</small></span><span className="snapshot-price">{euro.format(asset.price)}<small className={asset.change24h >= 0 ? 'positive' : 'negative'}>{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)} %</small></span></div>)}</div> : <p className="small-status">{status === 'error' ? error : 'Öffentliche Kursdaten werden abgerufen …'}</p>}
          <Link to="/finanzen" className="text-link">Zu den Märkten <ArrowRight size={15} /></Link>
        </InfoCard>
      </div>
      <div className="content-grid dashboard-content-grid lower-grid">
        <InfoCard title="Verbindungen" className="span-7">
          <div className="connection-grid">
            <div><span className="connection-dot ready" /><strong>Öffentliche Marktdaten</strong><small>Optional, browserseitig</small></div>
            <div><span className="connection-dot ready" /><strong>Öffentliches Wetter</strong><small>Optional, browserseitig</small></div>
            <div><span className="connection-dot" /><strong>Dateien & Dokumente</strong><small>Nicht verbunden</small></div>
            <div><span className="connection-dot" /><strong>KI-Anbieter</strong><small>Nicht verbunden</small></div>
          </div>
        </InfoCard>
        <InfoCard title="Zuletzt bearbeitet" className="span-5">
          <div className="recent-empty"><Clock3 size={18} /><span>Deine in der App erstellten Einträge erscheinen hier.</span></div>
        </InfoCard>
      </div>
      <Notice title="Deine Daten bleiben bei dir" variant="secure">Diese v0.1 liest keine persönlichen Dateien und besitzt keine aktivierte Dateisystemintegration.</Notice>
    </>
  )
}
