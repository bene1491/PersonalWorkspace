import { createContext, useContext } from 'react'
import { starterTasks } from '../data/demo'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useUndoableRemove } from '../hooks/useUndoableRemove'
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
    setTasks((current) => current.map((task) => {
      if (task.id !== id) return task
      const next = { ...task, ...patch }
      if (patch.status === 'done' && task.status !== 'done') next.completedAt = new Date().toISOString()
      else if (patch.status && patch.status !== 'done') next.completedAt = undefined
      return next
    }))
  }

  const removeTaskWithUndo = useUndoableRemove(tasks, setTasks)
  function deleteTask(id: string) {
    removeTaskWithUndo((task) => task.id === id, 'Aufgabe')
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
