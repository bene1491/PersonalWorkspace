import { useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, Check, ChevronLeft, ChevronRight, Circle, ListFilter, Plus, Rows3, Trash2 } from 'lucide-react'
import { PomodoroTimer } from '../components/PomodoroTimer'
import { useWorkspace } from '../components/WorkspaceContext'
import { InfoCard, Pill, SectionHeading } from '../components/ui'
import { areaLabels } from '../data/demo'
import type { Task, TaskPriority, TaskStatus, WorkspaceArea } from '../types'

const priorities: TaskPriority[] = ['high', 'medium', 'low']
const dayLabel = new Intl.DateTimeFormat('de-DE', { weekday: 'short' })
const dayMonthLabel = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' })
const dueDateLabel = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' })

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function startOfWeek(offsetWeeks: number) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const mondayOffset = (now.getDay() + 6) % 7
  now.setDate(now.getDate() - mondayOffset + offsetWeeks * 7)
  return now
}

function ProductivityChart({ tasks }: { tasks: Task[] }) {
  const data = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - index))
      return { date: isoDate(date), label: dayLabel.format(date), count: 0 }
    })
    for (const task of tasks) {
      if (!task.completedAt) continue
      const bucket = days.find((day) => day.date === task.completedAt!.slice(0, 10))
      if (bucket) bucket.count += 1
    }
    return days
  }, [tasks])
  const total = data.reduce((sum, day) => sum + day.count, 0)

  return (
    <InfoCard title="Produktivität" className="span-7">
      {total > 0 ? (
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={data} margin={{ top: 8, right: 4, left: -25, bottom: 0 }}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip formatter={(value) => [`${value} erledigt`, '']} cursor={{ fill: 'var(--surface-muted)' }} />
            <Bar dataKey="count" radius={[5, 5, 0, 0]} fill="var(--positive)" />
          </BarChart>
        </ResponsiveContainer>
      ) : <p className="small-status">Noch keine erledigten Aufgaben in den letzten 7 Tagen – schließe eine Aufgabe ab, um hier einen Verlauf zu sehen.</p>}
    </InfoCard>
  )
}

function WeekView({ tasks, updateTask }: { tasks: Task[]; updateTask: (id: string, patch: Partial<Pick<Task, 'status'>>) => void }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const monday = useMemo(() => startOfWeek(weekOffset), [weekOffset])
  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => { const date = new Date(monday); date.setDate(monday.getDate() + index); return date }), [monday])
  const todayIso = isoDate(new Date())
  const undated = tasks.filter((task) => !task.dueDate && task.status !== 'done')

  return (
    <InfoCard className="task-list-card">
      <div className="week-toolbar">
        <button className="icon-button" onClick={() => setWeekOffset((offset) => offset - 1)} aria-label="Vorherige Woche"><ChevronLeft size={16} /></button>
        <strong>{dayMonthLabel.format(days[0])} – {dayMonthLabel.format(days[6])}</strong>
        <button className="icon-button" onClick={() => setWeekOffset((offset) => offset + 1)} aria-label="Nächste Woche"><ChevronRight size={16} /></button>
        {weekOffset !== 0 && <button className="button button-ghost week-today-button" onClick={() => setWeekOffset(0)}>Heute</button>}
      </div>
      <div className="week-grid">
        {days.map((day) => {
          const iso = isoDate(day)
          const dayTasks = tasks.filter((task) => task.dueDate === iso)
          return (
            <div className={`week-day ${iso === todayIso ? 'is-today' : ''}`} key={iso}>
              <div className="week-day-head">{dayLabel.format(day)} {day.getDate()}.</div>
              {dayTasks.length ? dayTasks.map((task) => (
                <div className={`week-task ${task.status === 'done' ? 'is-done' : ''}`} key={task.id}>
                  <button onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'open' : 'done' })} aria-label="Status umschalten">{task.status === 'done' ? <Check size={11} /> : <Circle size={11} />}</button>
                  <span>{task.title}</span>
                </div>
              )) : <span className="week-day-empty">—</span>}
            </div>
          )
        })}
      </div>
      {undated.length > 0 && <div className="week-undated">
        <span className="week-undated-label">Ohne Datum</span>
        <div className="week-undated-list">{undated.map((task) => <span className="week-undated-chip" key={task.id}>{task.title}</span>)}</div>
      </div>}
    </InfoCard>
  )
}

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useWorkspace()
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<'list' | 'week'>('list')
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')
  const [areaFilter, setAreaFilter] = useState<WorkspaceArea | 'all'>('all')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [area, setArea] = useState<WorkspaceArea>('tasks')
  const [dueDate, setDueDate] = useState('')
  const visibleTasks = useMemo(() => tasks
    .filter((task) => filter === 'all' || task.status === filter)
    .filter((task) => areaFilter === 'all' || task.area === areaFilter)
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || priorities.indexOf(a.priority) - priorities.indexOf(b.priority)), [tasks, filter, areaFilter])

  function submitTask(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    addTask({ title: title.trim(), priority, area, dueDate: dueDate || undefined, status: 'open' })
    setTitle(''); setPriority('medium'); setArea('tasks'); setDueDate(''); setShowForm(false)
  }

  return <>
    <SectionHeading eyebrow="Planung" title="Aufgaben & Planung" description="Erstelle und verwalte Aufgaben direkt im Workspace. Änderungen bleiben lokal in deinem Browser." action={<button className="button button-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Neue Aufgabe</button>} />
    {showForm && <form className="task-form" onSubmit={submitTask}>
      <div className="form-grid"><label>Titel<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Was möchtest du erledigen?" /></label><label>Bereich<select value={area} onChange={(event) => setArea(event.target.value as WorkspaceArea)}>{Object.entries(areaLabels).filter(([key]) => !['command-center', 'settings'].includes(key)).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label>Priorität<select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}><option value="high">Hoch</option><option value="medium">Mittel</option><option value="low">Niedrig</option></select></label><label>Fällig am<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label></div>
      <div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setShowForm(false)}>Abbrechen</button><button className="button button-primary" type="submit">Aufgabe speichern</button></div>
    </form>}
    <div className="task-stat-grid"><InfoCard><small>Offen</small><strong>{tasks.filter((task) => task.status === 'open').length}</strong><span>bereit für deinen Fokus</span></InfoCard><InfoCard><small>In Arbeit</small><strong>{tasks.filter((task) => task.status === 'in-progress').length}</strong><span>aktive Vorhaben</span></InfoCard><InfoCard><small>Erledigt</small><strong>{tasks.filter((task) => task.status === 'done').length}</strong><span>im lokalen Verlauf</span></InfoCard></div>
    <div className="content-grid lower-grid">
      <ProductivityChart tasks={tasks} />
      <PomodoroTimer />
    </div>
    <div className="view-toggle lower-grid">
      <button className={`view-toggle-button ${view === 'list' ? 'is-active' : ''}`} onClick={() => setView('list')}><ListFilter size={14} /> Liste</button>
      <button className={`view-toggle-button ${view === 'week' ? 'is-active' : ''}`} onClick={() => setView('week')}><Rows3 size={14} /> Woche</button>
    </div>
    {view === 'week' ? <WeekView tasks={tasks} updateTask={updateTask} /> : (
      <InfoCard className="task-list-card">
        <div className="list-toolbar"><div className="filter-group"><ListFilter size={16} /><select value={filter} onChange={(event) => setFilter(event.target.value as 'all' | TaskStatus)} aria-label="Nach Status filtern"><option value="all">Alle Status</option><option value="open">Offen</option><option value="in-progress">In Arbeit</option><option value="done">Erledigt</option></select><select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value as WorkspaceArea | 'all')} aria-label="Nach Bereich filtern"><option value="all">Alle Bereiche</option>{Object.entries(areaLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><span>{visibleTasks.length} Einträge</span></div>
        {visibleTasks.length ? <div className="task-list">{visibleTasks.map((task) => <div className={`full-task-row ${task.status === 'done' ? 'is-done' : ''}`} key={task.id}>
          <button className="task-status-button" onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'open' : 'done' })} aria-label={task.status === 'done' ? 'Als offen markieren' : 'Als erledigt markieren'}>{task.status === 'done' ? <Check size={15} /> : <Circle size={15} />}</button>
          <div className="task-main"><strong>{task.title}</strong><span>{areaLabels[task.area]}</span></div>
          {task.dueDate && <span className="due-date"><CalendarDays size={14} />{dueDateLabel.format(new Date(`${task.dueDate}T12:00:00`))}</span>}
          <select className="row-select" value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })} aria-label="Status ändern"><option value="open">Offen</option><option value="in-progress">In Arbeit</option><option value="done">Erledigt</option></select>
          <Pill tone={task.priority === 'high' ? 'warning' : 'neutral'}>{task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}</Pill>
          <button className="row-delete" onClick={() => deleteTask(task.id)} aria-label={`${task.title} löschen`}><Trash2 size={16} /></button>
        </div>)}</div> : <div className="compact-empty">Für diese Filterkombination gibt es noch keine Aufgaben.</div>}
      </InfoCard>
    )}
  </>
}
