export const BACKUP_STORAGE_KEYS = [
  'personal-workspace.tasks.v1',
  'personal-workspace.watchlist.v1',
  'personal-workspace.investment-journal.v1',
  'personal-workspace.music-entries.v1',
  'personal-workspace.document-categories.v1',
  'personal-workspace.prompts.v1',
  'personal-workspace.flashcards.v1',
  'personal-workspace.pomodoro-settings.v1',
  'personal-workspace.theme.v1',
  'personal-workspace.accent.v1',
  'personal-workspace.location.v1',
  'personal-workspace.compact-mode.v1',
] as const

export interface BackupFile {
  app: 'personal-workspace'
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

export function createBackup(): BackupFile {
  const data: Record<string, unknown> = {}
  for (const key of BACKUP_STORAGE_KEYS) {
    const raw = window.localStorage.getItem(key)
    if (raw === null) continue
    try {
      data[key] = JSON.parse(raw)
    } catch {
      // skip values that are not valid JSON rather than corrupt the export
    }
  }
  return { app: 'personal-workspace', version: 1, exportedAt: new Date().toISOString(), data }
}

export function downloadBackup(): void {
  const backup = createBackup()
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `personal-workspace-backup-${backup.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<BackupFile>
  return candidate.app === 'personal-workspace' && typeof candidate.data === 'object' && candidate.data !== null
}

export function restoreBackup(backup: BackupFile): void {
  for (const key of BACKUP_STORAGE_KEYS) {
    if (key in backup.data) {
      window.localStorage.setItem(key, JSON.stringify(backup.data[key]))
    }
  }
}
