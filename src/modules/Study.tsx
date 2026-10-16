import { useState } from 'react'
import { BookOpenCheck, Check, ChevronRight, FileLock2, GraduationCap, PanelTop, Plus, X } from 'lucide-react'
import { EmptyState, InfoCard, Notice, Pill, SectionHeading } from '../components/ui'
import { courses } from '../data/demo'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useNextHoliday } from '../hooks/useNextHoliday'
import { useUndoableRemove } from '../hooks/useUndoableRemove'

interface Flashcard { id: string; front: string; back: string; createdAt: string }

const holidayDate = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function Flashcards() {
  const [cards, setCards] = useLocalStorage<Flashcard[]>('personal-workspace.flashcards.v1', [])
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const removeCard = useUndoableRemove(cards, setCards)

  const [quizQueue, setQuizQueue] = useState<Flashcard[] | null>(null)
  const [quizIndex, setQuizIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)

  function addCard(event: React.FormEvent) {
    event.preventDefault()
    if (!front.trim() || !back.trim()) return
    setCards((items) => [{ id: crypto.randomUUID(), front: front.trim(), back: back.trim(), createdAt: new Date().toISOString() }, ...items])
    setFront('')
    setBack('')
  }

  function startQuiz() {
    setQuizQueue(shuffled(cards))
    setQuizIndex(0)
    setRevealed(false)
    setCorrectCount(0)
  }

  function answer(correct: boolean) {
    if (correct) setCorrectCount((count) => count + 1)
    setQuizIndex((index) => index + 1)
    setRevealed(false)
  }

  const isSummary = quizQueue !== null && quizIndex >= quizQueue.length
  const currentCard = quizQueue && !isSummary ? quizQueue[quizIndex] : null

  return (
    <div className="content-grid lower-grid">
      <InfoCard title="Karteikarten verwalten" className="span-7">
        <form className="flashcard-form" onSubmit={addCard}>
          <input value={front} onChange={(event) => setFront(event.target.value)} placeholder="Vorderseite (Frage)" aria-label="Vorderseite" />
          <input value={back} onChange={(event) => setBack(event.target.value)} placeholder="Rückseite (Antwort)" aria-label="Rückseite" />
          <button className="button button-primary" type="submit"><Plus size={15} /> Hinzufügen</button>
        </form>
        {cards.length ? <div className="flashcard-list">{cards.map((card) => (
          <div className="flashcard-row" key={card.id}>
            <div><strong>{card.front}</strong><span>{card.back}</span></div>
            <button onClick={() => removeCard((item) => item.id === card.id, 'Karteikarte')}>Entfernen</button>
          </div>
        ))}</div> : <EmptyState title="Noch keine Karteikarten" icon={<BookOpenCheck size={21} />}>Lege eigene Karten an – Frage auf der Vorderseite, Antwort auf der Rückseite. Ausschließlich lokal gespeichert.</EmptyState>}
      </InfoCard>
      <InfoCard title="Lernmodus" className="span-5">
        {!quizQueue && (
          cards.length >= 2 ? (
            <div className="quiz-idle">
              <BookOpenCheck size={26} />
              <p>{cards.length} Karten bereit. Starte eine Lernrunde in zufälliger Reihenfolge.</p>
              <button className="button button-primary" onClick={startQuiz}>Lernmodus starten</button>
            </div>
          ) : <EmptyState title="Mindestens 2 Karten nötig" icon={<BookOpenCheck size={21} />}>Lege links ein paar Karteikarten an, um den Lernmodus zu starten.</EmptyState>
        )}
        {currentCard && (
          <div className="quiz-active">
            <div className="quiz-progress">Karte {quizIndex + 1} / {quizQueue!.length}</div>
            <button type="button" className={`quiz-card ${revealed ? 'is-revealed' : ''}`} onClick={() => setRevealed(true)}>
              <span className="quiz-card-label">{revealed ? 'Antwort' : 'Frage'}</span>
              <strong>{revealed ? currentCard.back : currentCard.front}</strong>
              {!revealed && <small>Tippen zum Aufdecken</small>}
            </button>
            {revealed && (
              <div className="quiz-answer-actions">
                <button className="button button-ghost" onClick={() => answer(false)}><X size={15} /> Nochmal üben</button>
                <button className="button button-primary" onClick={() => answer(true)}><Check size={15} /> Weiß ich</button>
              </div>
            )}
          </div>
        )}
        {isSummary && quizQueue && (
          <div className="quiz-summary">
            <strong>{correctCount} / {quizQueue.length} richtig</strong>
            <p>Lernrunde abgeschlossen.</p>
            <div className="form-actions">
              <button className="button button-ghost" onClick={() => setQuizQueue(null)}>Beenden</button>
              <button className="button button-primary" onClick={startQuiz}>Neu starten</button>
            </div>
          </div>
        )}
      </InfoCard>
    </div>
  )
}

export function Study() {
  const { data: holiday, status: holidayStatus, error: holidayError } = useNextHoliday('DE')
  return <>
    <SectionHeading eyebrow="Lernen" title="Uni & Studium" description="Eine lokale Lernzentrale für selbst angelegte Kurse, Notizen und Aufgaben." />
    <Notice title="Dauerhafte Schutzgrenze" variant="secure">Die Bachelorarbeit ist nicht verfügbar und kann weder über diese Oberfläche noch über zukünftige Freigaben eingebunden werden.</Notice>
    <div className="content-grid"><InfoCard title="Kurse & Module" className="span-8"><div className="course-list">{courses.map((course) => <article key={course.code}><div className="course-code">{course.code}</div><div><strong>{course.title}</strong><small>Beispieldaten · {course.status}</small></div><div className="progress-line"><span style={{ width: `${course.progress}%` }} /></div><span>{course.progress}%</span><ChevronRight size={17} /></article>)}</div></InfoCard><InfoCard title="Lernfortschritt" className="span-4"><EmptyState title="Noch keine Lernziele" icon={<GraduationCap size={21} />}>Lege später eigene Kurse und Meilensteine an. Diese Ansicht hat keinen Zugriff auf Uni-Ordner.</EmptyState></InfoCard></div>
    <div className="content-grid lower-grid">
      <InfoCard title="Lernwerkzeuge" className="span-7"><div className="tool-cards"><div><BookOpenCheck size={19} /><strong>Karteikarten & Quiz</strong><p>Eigene Karten anlegen und im Lernmodus abfragen – siehe Abschnitt unten.</p><Pill tone="positive">Aktiv</Pill></div><div><FileLock2 size={19} /><strong>PDF-Assistent</strong><p>Benötigt künftig eine konkrete, lesende Freigabe pro Datei.</p><Pill>Deaktiviert</Pill></div></div></InfoCard>
      <InfoCard title="Deadlines" className="span-5">
        <div className="holiday-block">
          <Pill tone={holidayStatus === 'ready' ? 'positive' : holidayStatus === 'error' ? 'warning' : 'neutral'}>{holidayStatus === 'ready' ? 'Öffentliche Daten' : holidayStatus === 'error' ? 'Nicht verfügbar' : 'Lädt'}</Pill>
          {holidayStatus === 'ready' && holiday && <div className="holiday-info"><strong>Nächster Feiertag: {holiday.localName}</strong><small>{holidayDate.format(new Date(`${holiday.date}T12:00:00`))} · Deutschland · Quelle: date.nager.at</small></div>}
          {holidayStatus === 'error' && <p className="small-status">{holidayError}</p>}
        </div>
        <EmptyState title="Keine App-Deadlines" icon={<PanelTop size={20} />}>Eigene Studienaufgaben kannst du im Planungsbereich anlegen.</EmptyState>
      </InfoCard>
    </div>
    <Flashcards />
  </>
}
