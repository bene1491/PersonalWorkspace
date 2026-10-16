export type WorkspaceArea =
  | 'command-center'
  | 'finance'
  | 'music'
  | 'study'
  | 'documents'
  | 'tasks'
  | 'ai-lab'
  | 'automations'
  | 'settings'

export type TaskStatus = 'open' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  area: WorkspaceArea
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
}

export interface JournalEntry {
  id: string
  title: string
  body: string
  createdAt: string
}

export interface MarketAsset {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  currency: string
  updatedAt: string
}

export interface SearchItem {
  id: string
  title: string
  subtitle: string
  area: WorkspaceArea
  href: string
}
