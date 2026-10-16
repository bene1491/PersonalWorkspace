import { createContext, useContext } from 'react'
import { starterTasks } from '../data/demo'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Task, WorkspaceArea } from '../types'

interface WorkspaceContextValue {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'area' | 'status' | 'priority' | 'dueDate'>>) => void
  deleteTask: (id: string) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('personal-workspace.tasks.v1', starterTasks)

  function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    setTasks((current) => [{ ...task, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current])
  }

  function updateTask(id: string, patch: Partial<Pick<Task, 'title' | 'area' | 'status' | 'priority' | 'dueDate'>>) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)))
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return <WorkspaceContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return context
}

export function getTaskSearchItems(tasks: Task[]) {
  return tasks.map((task) => ({
    id: `task-${task.id}`,
    title: task.title,
    subtitle: `Aufgabe · ${task.status === 'done' ? 'Erledigt' : 'Offen'}`,
    area: 'tasks' as WorkspaceArea,
    href: '/aufgaben',
  }))
}
