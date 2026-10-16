import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight,
  Bot,
  ChartNoAxesCombined,
  CheckSquare2,
  ChevronLeft,
  Command,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  Music2,
  Search,
  Settings2,
  Sun,
  WandSparkles,
  X,
} from 'lucide-react'
import { staticSearchItems } from '../data/demo'
import type { SearchItem } from '../types'
import { Pill } from './ui'

const navigation = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard, end: true },
  { to: '/finanzen', label: 'Finanzen', icon: ChartNoAxesCombined },
  { to: '/music-studio', label: 'Music Studio', icon: Music2 },
  { to: '/studium', label: 'Uni & Studium', icon: GraduationCap },
  { to: '/dokumente', label: 'Dateien & Dokumente', icon: FileText },
  { to: '/aufgaben', label: 'Aufgaben & Planung', icon: CheckSquare2 },
  { to: '/ai-lab', label: 'AI Lab', icon: Bot },
  { to: '/automatisierungen', label: 'Automatisierungen', icon: WandSparkles },
  { to: '/einstellungen', label: 'Einstellungen', icon: Settings2 },
]

interface AppShellProps {
  children: React.ReactNode
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  taskItems: SearchItem[]
}

export function AppShell({ children, theme, onToggleTheme, taskItems }: AppShellProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const resultItems = useMemo(() => {
    const source = [...staticSearchItems, ...taskItems]
    const search = query.trim().toLocaleLowerCase('de-DE')
    return search ? source.filter((item) => `${item.title} ${item.subtitle}`.toLocaleLowerCase('de-DE').includes(search)) : source.slice(0, 6)
  }, [query, taskItems])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  function chooseResult(item: SearchItem) {
    setSearchOpen(false)
    setQuery('')
    navigate(item.href)
  }

  const activeTitle = navigation.find((entry) => (entry.to === '/' ? location.pathname === '/' : location.pathname.startsWith(entry.to)))?.label ?? 'Personal Workspace'

  return (
    <div className={`app-frame ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && <button className="scrim" aria-label="Menü schließen" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Hauptnavigation">
        <div className="brand-row">
          <NavLink className="brand" to="/" aria-label="Personal Workspace Startseite">
            <span className="brand-mark"><Command size={18} strokeWidth={2.4} /></span>
            <span className="brand-name">Personal<span>Workspace</span></span>
          </NavLink>
          <button className="icon-button collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Seitenleiste umschalten">
            <ChevronLeft size={18} />
          </button>
          <button className="icon-button close-mobile" onClick={() => setMobileOpen(false)} aria-label="Navigation schließen"><X size={18} /></button>
        </div>
        <nav className="main-nav">
          <p className="nav-caption">Workspace</p>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link" onClick={() => setMobileOpen(false)}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="privacy-state">
            <span className="privacy-dot" />
            <div><strong>Lokaler Modus</strong><small>Keine Dateisystemfreigaben</small></div>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-start">
            <button className="icon-button menu-button" aria-label="Navigation öffnen" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
            <span className="current-section">{activeTitle}</span>
          </div>
          <div className="topbar-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)}>
              <Search size={17} />
              <span>Suche</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="icon-button theme-button" aria-label="Darstellung ändern" onClick={onToggleTheme}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
      {searchOpen && (
        <div className="search-layer" role="dialog" aria-modal="true" aria-label="Globale Suche">
          <button className="scrim search-scrim" aria-label="Suche schließen" onClick={() => setSearchOpen(false)} />
          <div className="command-menu">
            <div className="command-input"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Workspace durchsuchen …" /><kbd>Esc</kbd></div>
            <div className="search-results">
              <p className="result-caption">{query ? 'Ergebnisse' : 'Schnellzugriff'}</p>
              {resultItems.length ? resultItems.map((item) => (
                <button key={item.id} className="search-result" onClick={() => chooseResult(item)}>
                  <span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ArrowUpRight size={16} />
                </button>
              )) : <div className="no-results">Keine Einträge in deinem lokalen Workspace gefunden.</div>}
            </div>
            <div className="command-footer"><Pill tone="positive">Nur App-Daten</Pill><span>Durchsucht weder Ordner noch persönliche Dateien.</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
