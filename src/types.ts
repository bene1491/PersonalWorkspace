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
  completedAt?: string
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
  sparkline7d: number[]
  marketCap: number
  high24h: number
  low24h: number
}

export interface SearchItem {
  id: string
  title: string
  subtitle: string
  area: WorkspaceArea
  href: string
}

export interface WeatherSnapshot {
  city: string
  country?: string
  temperature: number
  apparentTemperature: number
  humidity: number
  windSpeed: number
  weatherCode: number
  isDay: boolean
  updatedAt: string
}
