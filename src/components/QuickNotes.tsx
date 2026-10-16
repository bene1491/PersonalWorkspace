import { useEffect, useRef, useState } from 'react'
import { StickyNote, X } from 'lucide-react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export function QuickNotes() {
  const [note, setNote] = useLocalStorage<string>('personal-workspace.quick-note.v1', '')
  const [open, setOpen] = useState(false)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  function openNotes() {
    lastFocusedRef.current = document.activeElement as HTMLElement | null
    setOpen(true)
  }

  useEffect(() => {
    if (!open && lastFocusedRef.current) {
      lastFocusedRef.current.focus()
      lastFocusedRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <>
      <button className={`icon-button notes-button ${note.trim() ? 'has-content' : ''}`} aria-label="Schnellnotizen öffnen" onClick={openNotes}>
        <StickyNote size={18} />
      </button>
      {open && (
        <div className="notes-layer" role="dialog" aria-modal="true" aria-label="Schnellnotizen">
          <button className="scrim" aria-label="Schnellnotizen schließen" onClick={() => setOpen(false)} />
          <div className="notes-panel">
            <div className="notes-panel-head">
              <strong>Schnellnotizen</strong>
              <button className="icon-button" aria-label="Schnellnotizen schließen" onClick={() => setOpen(false)}><X size={16} /></button>
            </div>
            <textarea
              autoFocus
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Gedanken, Ideen, Erinnerungen … wird automatisch gespeichert, egal auf welcher Seite du bist."
            />
            <p className="notes-panel-footer">Nur lokal in diesem Browser gespeichert · Teil des Backup-Exports in den Einstellungen.</p>
          </div>
        </div>
      )}
    </>
  )
}
