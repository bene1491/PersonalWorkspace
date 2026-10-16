import { useEffect, useRef, useState } from 'react'
import { Hand, Play, Square } from 'lucide-react'
import { InfoCard } from './ui'

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_SECONDS = 0.1
const MIN_BPM = 30
const MAX_BPM = 240
const BEAT_OPTIONS = [2, 3, 4, 6]

export function Metronome({ onApplyBpm }: { onApplyBpm?: (bpm: number) => void }) {
  const [bpm, setBpm] = useState(120)
  const [beatsPerBar, setBeatsPerBar] = useState(4)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeBeat, setActiveBeat] = useState<number | null>(null)

  const bpmRef = useRef(bpm)
  const beatsPerBarRef = useRef(beatsPerBar)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextNoteTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const timerIdRef = useRef<number | null>(null)
  const tapTimesRef = useRef<number[]>([])

  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { beatsPerBarRef.current = beatsPerBar }, [beatsPerBar])

  useEffect(() => () => stop(), [])

  function scheduleNote(beatNumber: number, time: number) {
    const ctx = audioCtxRef.current
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = beatNumber === 0 ? 1050 : 700
    gain.gain.setValueAtTime(0.6, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(time)
    osc.stop(time + 0.05)
    const delayMs = Math.max(0, (time - ctx.currentTime) * 1000)
    window.setTimeout(() => setActiveBeat(beatNumber), delayMs)
  }

  function scheduler() {
    const ctx = audioCtxRef.current
    if (!ctx) return
    while (nextNoteTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD_SECONDS) {
      scheduleNote(currentBeatRef.current, nextNoteTimeRef.current)
      nextNoteTimeRef.current += 60 / bpmRef.current
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerBarRef.current
    }
    timerIdRef.current = window.setTimeout(scheduler, LOOKAHEAD_MS)
  }

  function start() {
    if (isPlaying) return
    const ctx = new AudioContext()
    audioCtxRef.current = ctx
    currentBeatRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05
    setIsPlaying(true)
    scheduler()
  }

  function stop() {
    setIsPlaying(false)
    setActiveBeat(null)
    if (timerIdRef.current) window.clearTimeout(timerIdRef.current)
    timerIdRef.current = null
    void audioCtxRef.current?.close()
    audioCtxRef.current = null
  }

  function handleTap() {
    const now = performance.now()
    const times = tapTimesRef.current
    const last = times[times.length - 1]
    if (last !== undefined && now - last > 2200) times.length = 0
    times.push(now)
    if (times.length > 8) times.shift()
    if (times.length >= 2) {
      const intervals = times.slice(1).map((time, index) => time - times[index])
      const averageMs = intervals.reduce((sum, value) => sum + value, 0) / intervals.length
      setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(60000 / averageMs))))
    }
  }

  return (
    <InfoCard title="Metronom & Tap-Tempo" className="span-6">
      <div className="metronome">
        <div className="metronome-display">
          <input
            type="number"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(event) => setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, Number(event.target.value) || MIN_BPM)))}
            aria-label="BPM"
          />
          <span>BPM</span>
        </div>
        <input
          className="tempo-slider"
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={bpm}
          onChange={(event) => setBpm(Number(event.target.value))}
          aria-label="Tempo-Regler"
        />
        <div className="metronome-dots" aria-hidden="true">
          {Array.from({ length: beatsPerBar }, (_, index) => (
            <span key={index} className={`metronome-dot ${activeBeat === index ? 'is-active' : ''} ${index === 0 ? 'is-accent' : ''}`} />
          ))}
        </div>
        <div className="metronome-controls">
          <button className="button button-primary" onClick={isPlaying ? stop : start}>
            {isPlaying ? <Square size={15} /> : <Play size={15} />} {isPlaying ? 'Stopp' : 'Start'}
          </button>
          <button className="button button-ghost" onClick={handleTap}><Hand size={15} /> Tap</button>
          <select value={beatsPerBar} onChange={(event) => setBeatsPerBar(Number(event.target.value))} aria-label="Takt">
            {BEAT_OPTIONS.map((value) => <option key={value} value={value}>{value}/4</option>)}
          </select>
          {onApplyBpm && <button className="button button-ghost" onClick={() => onApplyBpm(bpm)}>In Songidee übernehmen</button>}
        </div>
        <p className="small-status">Läuft vollständig im Browser über die Web Audio API – kein Audio wird aufgenommen, importiert oder gespeichert.</p>
      </div>
    </InfoCard>
  )
}
