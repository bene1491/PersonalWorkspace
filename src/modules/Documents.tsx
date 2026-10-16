import { useState } from 'react'
import { FileLock2, FilePlus2, FolderLock, RefreshCw, ShieldCheck } from 'lucide-react'
import { EmptyState, InfoCard, Notice, SectionHeading } from '../components/ui'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useUndoableRemove } from '../hooks/useUndoableRemove'

export function Documents() {
  const [categories, setCategories] = useLocalStorage<string[]>('personal-workspace.document-categories.v1', [])
  const [category, setCategory] = useState('')
  const removeCategory = useUndoableRemove(categories, setCategories)
  return <>
    <SectionHeading eyebrow="Lokale Architektur" title="Dateien & Dokumente" description="Ein sicherer Ausgangspunkt für spätere, explizit freigegebene, rein lesende Verzeichnisse." />
    <Notice title="Kein Dateisystemzugriff aktiv" variant="secure">Die Bibliothek durchsucht keinen Mac, zeigt keine realen lokalen Pfade und kann keine Dateien verändern.</Notice>
    <div className="content-grid"><InfoCard className="span-8" title="Dokumentbibliothek"><EmptyState title="Noch keine freigegebenen Quellen" icon={<FolderLock size={23} />}>Eine spätere Verbindung darf nur einen konkret gewählten Ordner lesen. Indizes und Metadaten würden getrennt von Originalen gespeichert.</EmptyState></InfoCard><InfoCard className="span-4" title="Berechtigungsmodell"><div className="permission-list"><div><ShieldCheck size={17} /><span><strong>Freigaben</strong><small>Keine aktiv</small></span></div><div><FileLock2 size={17} /><span><strong>Bachelorarbeit</strong><small>Permanent ausgeschlossen</small></span></div><div><RefreshCw size={17} /><span><strong>Indexer</strong><small>Nicht aktiv</small></span></div></div></InfoCard></div>
    <div className="content-grid lower-grid"><InfoCard className="span-6" title="Kategorien"><form className="watchlist-form" onSubmit={(event) => { event.preventDefault(); const name = category.trim(); if (name && !categories.includes(name)) setCategories((items) => [...items, name]); setCategory('') }}><input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Lokale Kategorie anlegen" /><button className="button button-ghost">Anlegen</button></form>{categories.length ? <div className="tag-list">{categories.map((item) => <button key={item} onClick={() => removeCategory((current) => current === item, `Kategorie „${item}“`)}>{item} ×</button>)}</div> : <p className="small-status">Kategorien gelten nur für später in der App vorhandene Einträge.</p>}</InfoCard><InfoCard className="span-6" title="Lokale Indexierung"><EmptyState title="Vorbereitet, aber ausgeschaltet" icon={<FilePlus2 size={21} />}>Bei einer späteren Freigabe wäre die Integration ausschließlich lesend, konkret begrenzt und ohne automatische Ordnererkennung.</EmptyState></InfoCard></div>
  </>
}
