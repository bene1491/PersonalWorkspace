import { useMemo, useState } from 'react'
import { CalendarDays, Check, Circle, ListFilter, Plus, Trash2 } from 'lucide-react'
import { useWorkspace } from '../components/WorkspaceContext'
import { InfoCard, Pill, SectionHeading } from '../components/ui'
import { areaLabels } from '../data/demo'
import type { TaskPriority, TaskStatus, WorkspaceArea } from '../types'

const priorities: TaskPriority[] = ['high', 'medium', 'low']

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useWorkspace()
  const [showForm, setShowForm] = useState(false)
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
    <InfoCard className="task-list-card">
      <div className="list-toolbar"><div className="filter-group"><ListFilter size={16} /><select value={filter} onChange={(event) => setFilter(event.target.value as 'all' | TaskStatus)} aria-label="Nach Status filtern"><option value="all">Alle Status</option><option value="open">Offen</option><option value="in-progress">In Arbeit</option><option value="done">Erledigt</option></select><select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value as WorkspaceArea | 'all')} aria-label="Nach Bereich filtern"><option value="all">Alle Bereiche</option>{Object.entries(areaLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><span>{visibleTasks.length} Einträge</span></div>
      {visibleTasks.length ? <div className="task-list">{visibleTasks.map((task) => <div className={`full-task-row ${task.status === 'done' ? 'is-done' : ''}`} key={task.id}>
        <button className="task-status-button" onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'open' : 'done' })} aria-label={task.status === 'done' ? 'Als offen markieren' : 'Als erledigt markieren'}>{task.status === 'done' ? <Check size={15} /> : <Circle size={15} />}</button>
        <div className="task-main"><strong>{task.title}</strong><span>{areaLabels[task.area]}</span></div>
        {task.dueDate && <span className="due-date"><CalendarDays size={14} />{new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' }).format(new Date(`${task.dueDate}T12:00:00`))}</span>}
        <select className="row-select" value={task.status} onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })} aria-label="Status ändern"><option value="open">Offen</option><option value="in-progress">In Arbeit</option><option value="done">Erledigt</option></select>
        <Pill tone={task.priority === 'high' ? 'warning' : 'neutral'}>{task.priority === 'high' ? 'Hoch' : task.priority === 'medium' ? 'Mittel' : 'Niedrig'}</Pill>
        <button className="row-delete" onClick={() => deleteTask(task.id)} aria-label={`${task.title} löschen`}><Trash2 size={16} /></button>
      </div>)}</div> : <div className="compact-empty">Für diese Filterkombination gibt es noch keine Aufgaben.</div>}
    </InfoCard>
  </>
}
