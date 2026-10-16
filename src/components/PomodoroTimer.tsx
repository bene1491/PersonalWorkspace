import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { InfoCard } from './ui'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface PomodoroSettings {
  focusMinutes: number
  breakMinutes: number
}

const DEFAULT_SETTINGS: PomodoroSettings = { focusMinutes: 25, breakMinutes: 5 }

function playChime() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.35, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
    osc.onended = () => void ctx.close()
  } catch {
    // Web Audio not available in this context — fail silently, timer still works visually
  }
}

export function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('personal-workspace.pomodoro-settings.v1', DEFAULT_SETTINGS)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds > 1) return seconds - 1
        playChime()
        setMode((current) => {
          const next = current === 'focus' ? 'break' : 'focus'
          setSecondsLeft((next === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60)
          return next
        })
        return 0
      })
    }, 1000)
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current) }
  }, [isRunning, settings])

  function reset() {
    setIsRunning(false)
    setSecondsLeft((mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60)
  }

  function updateDuration(field: keyof PomodoroSettings, value: number) {
    const clamped = Math.min(90, Math.max(1, value || 1))
    const next = { ...settings, [field]: clamped }
    setSettings(next)
    const activeField: keyof PomodoroSettings = mode === 'focus' ? 'focusMinutes' : 'breakMinutes'
    if (!isRunning && field === activeField) setSecondsLeft(clamped * 60)
  }

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
  const seconds = (secondsLeft % 60).toString().padStart(2, '0')
  const totalSeconds = (mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0

  return (
    <InfoCard title="Fokus-Timer" className="span-5">
      <div className="pomodoro">
        <div className="pomodoro-ring" style={{ '--progress': progress } as CSSProperties}>
          <div className="pomodoro-ring-inner">
            <span className="pomodoro-time">{minutes}:{seconds}</span>
            <span className="pomodoro-mode">{mode === 'focus' ? 'Fokus' : 'Pause'}</span>
          </div>
        </div>
        <div className="pomodoro-controls">
          <button className="button button-primary" onClick={() => setIsRunning((running) => !running)}>
            {isRunning ? <Pause size={15} /> : <Play size={15} />} {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="button button-ghost" onClick={reset}><RotateCcw size={15} /> Zurücksetzen</button>
        </div>
        <div className="pomodoro-settings">
          <label>Fokus (Min.)<input type="number" min={1} max={90} value={settings.focusMinutes} onChange={(event) => updateDuration('focusMinutes', Number(event.target.value))} /></label>
          <label>Pause (Min.)<input type="number" min={1} max={90} value={settings.breakMinutes} onChange={(event) => updateDuration('breakMinutes', Number(event.target.value))} /></label>
        </div>
        <p className="small-status">Läuft lokal in diesem Browser-Tab, kein Hintergrundprozess außerhalb der App.</p>
      </div>
    </InfoCard>
  )
}
