import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { getTaskSearchItems, useWorkspace, WorkspaceProvider } from './components/WorkspaceContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Dashboard } from './modules/Dashboard'
import { Tasks } from './modules/Tasks'

const Finance = lazy(() => import('./modules/Finance').then((module) => ({ default: module.Finance })))
const CoinDetail = lazy(() => import('./modules/Finance').then((module) => ({ default: module.CoinDetail })))
const MusicStudio = lazy(() => import('./modules/WorkspaceModules').then((module) => ({ default: module.MusicStudio })))
const Study = lazy(() => import('./modules/WorkspaceModules').then((module) => ({ default: module.Study })))
const Documents = lazy(() => import('./modules/WorkspaceModules').then((module) => ({ default: module.Documents })))
const AiLab = lazy(() => import('./modules/WorkspaceModules').then((module) => ({ default: module.AiLab })))
const Automations = lazy(() => import('./modules/WorkspaceModules').then((module) => ({ default: module.Automations })))
const Settings = lazy(() => import('./modules/WorkspaceModules').then((module) => ({ default: module.Settings })))

function RouteLoading() {
  return <div className="route-loading"><span className="loader" /></div>
}

function WorkspaceApp() {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('personal-workspace.theme.v1', 'dark')
  const [location, setLocation] = useLocalStorage<string>('personal-workspace.location.v1', 'Berlin')
  const { tasks } = useWorkspace()
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')

  return <AppShell theme={theme} onToggleTheme={toggleTheme} taskItems={getTaskSearchItems(tasks)}>
    <ErrorBoundary>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Dashboard location={location} />} />
          <Route path="/finanzen" element={<Finance />} />
          <Route path="/finanzen/:id" element={<CoinDetail />} />
          <Route path="/music-studio" element={<MusicStudio />} />
          <Route path="/studium" element={<Study />} />
          <Route path="/dokumente" element={<Documents />} />
          <Route path="/aufgaben" element={<Tasks />} />
          <Route path="/ai-lab" element={<AiLab />} />
          <Route path="/automatisierungen" element={<Automations />} />
          <Route path="/einstellungen" element={<Settings theme={theme} onToggleTheme={toggleTheme} location={location} onLocationChange={setLocation} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </AppShell>
}

export default function App() {
  return <BrowserRouter><WorkspaceProvider><WorkspaceApp /></WorkspaceProvider></BrowserRouter>
}
