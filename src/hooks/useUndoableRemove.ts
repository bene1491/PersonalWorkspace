import type { Dispatch, SetStateAction } from 'react'
import { useToast } from '../components/ToastContext'

export function useUndoableRemove<T>(items: T[], setItems: Dispatch<SetStateAction<T[]>>) {
  const { showToast } = useToast()

  return (predicate: (item: T) => boolean, label: string) => {
    const index = items.findIndex(predicate)
    if (index === -1) return
    const removed = items[index]
    setItems((current) => current.filter((item) => !predicate(item)))
    showToast(`${label} gelöscht`, {
      label: 'Rückgängig',
      onClick: () => setItems((current) => {
        const next = [...current]
        next.splice(Math.min(index, next.length), 0, removed)
        return next
      }),
    })
  }
}
