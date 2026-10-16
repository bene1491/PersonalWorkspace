import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { getTaskSearchItems, useWorkspace, WorkspaceProvider } from './components/WorkspaceContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Dashboard } from './modules/Dashboard'
import { Finance } from './modules/Finance'
import { Tasks } from './modules/Tasks'
import { AiLab, Automations, Documents, MusicStudio, Settings, Study } from './modules/WorkspaceModules'

function WorkspaceApp() {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('personal-workspace.theme.v1', 'dark')
  const { tasks } = useWorkspace()
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark')

  return <AppShell theme={theme} onToggleTheme={toggleTheme} taskItems={getTaskSearchItems(tasks)}>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/finanzen" element={<Finance />} />
      <Route path="/music-studio" element={<MusicStudio />} />
      <Route path="/studium" element={<Study />} />
      <Route path="/dokumente" element={<Documents />} />
      <Route path="/aufgaben" element={<Tasks />} />
      <Route path="/ai-lab" element={<AiLab />} />
      <Route path="/automatisierungen" element={<Automations />} />
      <Route path="/einstellungen" element={<Settings theme={theme} onToggleTheme={toggleTheme} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppShell>
}

export default function App() {
  return <BrowserRouter><WorkspaceProvider><WorkspaceApp /></WorkspaceProvider></BrowserRouter>
}
