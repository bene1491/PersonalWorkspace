import type { SearchItem, Task, WorkspaceArea } from '../types'

export const areaLabels: Record<WorkspaceArea, string> = {
  'command-center': 'Command Center',
  finance: 'Finanzen',
  music: 'Music Studio',
  study: 'Uni & Studium',
  documents: 'Dateien & Dokumente',
  tasks: 'Aufgaben & Planung',
  'ai-lab': 'AI Lab',
  automations: 'Automatisierungen',
  settings: 'Einstellungen',
}

export const starterTasks: Task[] = [
  {
    id: 'welcome-task',
    title: 'Deinen ersten Workspace-Eintrag anlegen',
    area: 'tasks',
    status: 'open',
    priority: 'medium',
    dueDate: undefined,
    createdAt: new Date().toISOString(),
  },
]

export const staticSearchItems: SearchItem[] = [
  { id: 'finance', title: 'Finanzübersicht', subtitle: 'Marktdaten, Watchlist und Journal', area: 'finance', href: '/finanzen' },
  { id: 'music', title: 'Music Studio', subtitle: 'Lokale Projektbibliothek ohne Dateizugriff', area: 'music', href: '/music-studio' },
  { id: 'study', title: 'Uni & Studium', subtitle: 'Kurse, Lernen und akademische Projekte', area: 'study', href: '/studium' },
  { id: 'documents', title: 'Dateien & Dokumente', subtitle: 'Freigabebasierte Dokumentenarchitektur', area: 'documents', href: '/dokumente' },
  { id: 'ai', title: 'AI Lab', subtitle: 'Prompts und vorbereitete Workflows', area: 'ai-lab', href: '/ai-lab' },
  { id: 'automations', title: 'Automatisierungen', subtitle: 'Inaktive Workflow-Vorlagen', area: 'automations', href: '/automatisierungen' },
]

export const courses = [
  { code: 'WS-01', title: 'Beispielkurs: Projektplanung', progress: 0, status: 'Nicht verbunden' },
  { code: 'WS-02', title: 'Beispielkurs: Lernsystem einrichten', progress: 0, status: 'Nicht verbunden' },
]

export const workflowCards = [
  { title: 'Tägliches Briefing', description: 'Fasst später freigegebene Workspace-Daten zusammen.', icon: 'Sunrise' },
  { title: 'Marktbeobachtung', description: 'Bereitet Kursalarme vor; führt keine Benachrichtigungen aus.', icon: 'ChartNoAxesCombined' },
  { title: 'Produktions-Checkliste', description: 'Erinnert künftig an manuell aktivierte Studienschritte.', icon: 'Music2' },
  { title: 'Wochenrückblick', description: 'Vorlage für eine lokale Zusammenfassung deiner App-Einträge.', icon: 'CalendarRange' },
]
