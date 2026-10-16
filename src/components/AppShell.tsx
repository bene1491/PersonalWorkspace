import { useEffect, useMemo, useRef, useState } from 'react'
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
  Zap,
} from 'lucide-react'
import { staticSearchItems } from '../data/demo'
import { buildLocalSearchItems } from '../services/searchIndex'
import type { SearchItem } from '../types'
import { Pill } from './ui'

type PaletteItem =
  | { kind: 'action'; id: string; title: string; subtitle: string; run: () => void }
  | { kind: 'nav'; id: string; title: string; subtitle: string; href: string }

function toNavItem(item: SearchItem): PaletteItem {
  return { kind: 'nav', id: item.id, title: item.title, subtitle: item.subtitle, href: item.href }
}

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
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)
  const prevMobileOpenRef = useRef(false)

  const commandActions: PaletteItem[] = useMemo(() => [
    {
      kind: 'action',
      id: 'action-theme',
      title: theme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren',
      subtitle: 'Darstellung umschalten',
      run: onToggleTheme,
    },
    {
      kind: 'action',
      id: 'action-new-task',
      title: 'Neue Aufgabe anlegen',
      subtitle: 'Öffnet das Aufgaben-Formular in Aufgaben & Planung',
      run: () => navigate('/aufgaben?new=1'),
    },
    {
      kind: 'action',
      id: 'action-pomodoro',
      title: 'Pomodoro-Timer starten',
      subtitle: 'Startet den Fokus-Timer in Aufgaben & Planung',
      run: () => navigate('/aufgaben?focus=1'),
    },
  ], [theme, onToggleTheme, navigate])

  const localItems = useMemo(() => (searchOpen ? buildLocalSearchItems().map(toNavItem) : []), [searchOpen])

  const resultItems = useMemo(() => {
    const navItems = [...staticSearchItems.map(toNavItem), ...taskItems.map(toNavItem), ...localItems]
    const source: PaletteItem[] = [...commandActions, ...navItems]
    const search = query.trim().toLocaleLowerCase('de-DE')
    return search ? source.filter((item) => `${item.title} ${item.subtitle}`.toLocaleLowerCase('de-DE').includes(search)) : source.slice(0, 8)
  }, [query, taskItems, localItems, commandActions])

  // Captures the currently focused element *before* the dialog mounts and steals focus via autoFocus,
  // so closing the palette can hand focus back to whatever opened it.
  function openSearch() {
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    setSearchOpen(true)
  }

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openSearch()
      }
      if (event.key === 'Escape') {
        setSearchOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Return focus to whatever triggered the command palette once it closes.
  useEffect(() => {
    if (!searchOpen && lastFocusedRef.current) {
      lastFocusedRef.current.focus()
      lastFocusedRef.current = null
    }
  }, [searchOpen])

  useEffect(() => { setHighlightedIndex(0) }, [resultItems])

  // Move focus into the mobile nav drawer when it opens, and back to the menu button when it closes.
  useEffect(() => {
    if (mobileOpen) mobileCloseRef.current?.focus()
    else if (prevMobileOpenRef.current) menuTriggerRef.current?.focus()
    prevMobileOpenRef.current = mobileOpen
  }, [mobileOpen])

  function chooseResult(item: PaletteItem) {
    setSearchOpen(false)
    setQuery('')
    if (item.kind === 'action') item.run()
    else navigate(item.href)
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((index) => Math.min(index + 1, resultItems.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = resultItems[highlightedIndex]
      if (item) chooseResult(item)
    }
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
          <button ref={mobileCloseRef} className="icon-button close-mobile" onClick={() => setMobileOpen(false)} aria-label="Navigation schließen"><X size={18} /></button>
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
            <button ref={menuTriggerRef} className="icon-button menu-button" aria-label="Navigation öffnen" onClick={() => setMobileOpen(true)}><Menu size={19} /></button>
            <span className="current-section">{activeTitle}</span>
          </div>
          <div className="topbar-actions">
            <button className="search-trigger" onClick={openSearch}>
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
            <div className="command-input">
              <Search size={19} />
              <input
                autoFocus
                role="combobox"
                aria-expanded={searchOpen}
                aria-controls="command-results-list"
                aria-autocomplete="list"
                aria-activedescendant={resultItems[highlightedIndex] ? `command-option-${resultItems[highlightedIndex].id}` : undefined}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Workspace durchsuchen …"
              />
              <kbd>Esc</kbd>
            </div>
            <div className="search-results" role="listbox" id="command-results-list" aria-label="Suchergebnisse">
              <p className="result-caption">{query ? 'Ergebnisse' : 'Schnellzugriff'}</p>
              {resultItems.length ? resultItems.map((item, index) => (
                <div
                  key={item.id}
                  id={`command-option-${item.id}`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  className={`search-result ${index === highlightedIndex ? 'is-highlighted' : ''}`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => chooseResult(item)}
                >
                  <span><strong>{item.title}</strong><small>{item.subtitle}</small></span>
                  {item.kind === 'action' ? <Zap size={16} /> : <ArrowUpRight size={16} />}
                </div>
              )) : <div className="no-results">Keine Einträge in deinem lokalen Workspace gefunden.</div>}
            </div>
            <div className="command-footer"><Pill tone="positive">Nur App-Daten</Pill><span>Durchsucht weder Ordner noch persönliche Dateien · <kbd>↑↓</kbd> navigieren · <kbd>↵</kbd> auswählen</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
