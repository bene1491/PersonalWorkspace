import { RefreshCw, Workflow } from 'lucide-react'
import { EmptyState, InfoCard, Notice, Pill, SectionHeading } from '../components/ui'
import { workflowCards } from '../data/demo'

export function Automations() {
  return <>
    <SectionHeading eyebrow="Workflow-Katalog" title="Automatisierungen" description="Übersicht zukünftiger Abläufe. Keine Karte startet Prozesse, Timer oder Dateisystemaktionen." />
    <Notice title="Alle Workflows sind inaktiv" variant="secure">Es laufen keine Hintergrunddienste, Scheduler oder automatischen Dateivorgänge – weder jetzt noch nach dem Schließen der Anwendung.</Notice>
    <div className="workflow-grid">{workflowCards.map((workflow) => <InfoCard key={workflow.title} className="workflow-card"><div className="workflow-icon"><Workflow size={19} /></div><Pill>Entwurf</Pill><h2>{workflow.title}</h2><p>{workflow.description}</p><div className="workflow-bottom"><span><span className="connection-dot" /> Nicht aktiv</span><button disabled>Konfigurieren</button></div></InfoCard>)}</div>
    <InfoCard title="Ausführungshistorie" className="lower-grid"><EmptyState title="Noch keine Ausführungen" icon={<RefreshCw size={21} />}>Workflow-Aktivität wird erst sichtbar, wenn du zukünftig eine konkrete Automatisierung bewusst aktivierst.</EmptyState></InfoCard>
  </>
}
