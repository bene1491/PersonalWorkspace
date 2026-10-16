import { useEffect, useState } from 'react'
import { Bell, BellRing, Trash2 } from 'lucide-react'
import { EmptyState, InfoCard, Pill } from './ui'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useUndoableRemove } from '../hooks/useUndoableRemove'
import type { MarketAsset, PriceAlert } from '../types'

const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function PriceAlerts({ data, status }: { data: MarketAsset[]; status: 'loading' | 'ready' | 'error' }) {
  const [alerts, setAlerts] = useLocalStorage<PriceAlert[]>('personal-workspace.price-alerts.v1', [])
  const [symbol, setSymbol] = useState('')
  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [threshold, setThreshold] = useState('')
  const [permission, setPermission] = useState<NotificationPermissionState>(getNotificationPermission)
  const removeAlert = useUndoableRemove(alerts, setAlerts)

  // Check every time fresh market data arrives whether any armed alert has been crossed.
  useEffect(() => {
    if (status !== 'ready' || data.length === 0) return
    setAlerts((current) => {
      let changed = false
      const next = current.map((alert) => {
        if (alert.triggeredAt) return alert
        const asset = data.find((entry) => entry.symbol === alert.symbol)
        if (!asset) return alert
        const crossed = alert.direction === 'above' ? asset.price >= alert.threshold : asset.price <= alert.threshold
        if (!crossed) return alert
        changed = true
        if (getNotificationPermission() === 'granted') {
          new Notification(`Kursalarm: ${alert.symbol}`, {
            body: `${alert.symbol} liegt jetzt bei ${money.format(asset.price)} (Ziel: ${alert.direction === 'above' ? '≥' : '≤'} ${money.format(alert.threshold)}).`,
          })
        }
        return { ...alert, triggeredAt: new Date().toISOString() }
      })
      return changed ? next : current
    })
    // setAlerts is a stable localStorage setter; including it would not change behavior but re-triggers on every render otherwise.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, status])

  function requestPermission() {
    if (getNotificationPermission() === 'unsupported') return
    void Notification.requestPermission().then((result) => setPermission(result))
  }

  function addAlert(event: React.FormEvent) {
    event.preventDefault()
    const value = Number(threshold.replace(',', '.'))
    if (!symbol || !Number.isFinite(value) || value <= 0) return
    const asset = data.find((entry) => entry.symbol === symbol)
    const alreadyCrossed = asset ? (direction === 'above' ? asset.price >= value : asset.price <= value) : false
    setAlerts((items) => [{
      id: crypto.randomUUID(),
      symbol,
      direction,
      threshold: value,
      createdAt: new Date().toISOString(),
      triggeredAt: alreadyCrossed ? new Date().toISOString() : undefined,
    }, ...items])
    setThreshold('')
  }

  function resetAlert(id: string) {
    setAlerts((items) => items.map((alert) => (alert.id === id ? { ...alert, triggeredAt: undefined } : alert)))
  }

  return (
    <InfoCard title="Preis-Alarme">
      <form className="alert-form" onSubmit={addAlert}>
        <select value={symbol} onChange={(event) => setSymbol(event.target.value)} aria-label="Asset für Alarm">
          <option value="">Asset …</option>
          {data.map((asset) => <option key={asset.id} value={asset.symbol}>{asset.symbol}</option>)}
        </select>
        <select value={direction} onChange={(event) => setDirection(event.target.value as 'above' | 'below')} aria-label="Richtung">
          <option value="above">über</option>
          <option value="below">unter</option>
        </select>
        <input value={threshold} onChange={(event) => setThreshold(event.target.value)} placeholder="Preis €" inputMode="decimal" aria-label="Schwellenwert in Euro" />
        <button className="button button-primary" type="submit" disabled={status !== 'ready'}><Bell size={14} /></button>
      </form>
      {permission === 'default' && (
        <button className="button button-ghost alert-permission-button" onClick={requestPermission}><BellRing size={14} /> Browser-Benachrichtigungen erlauben</button>
      )}
      {alerts.length ? (
        <div className="alert-list">
          {alerts.map((alert) => (
            <div className={`alert-row ${alert.triggeredAt ? 'is-triggered' : ''}`} key={alert.id}>
              <span>{alert.symbol} {alert.direction === 'above' ? '≥' : '≤'} {money.format(alert.threshold)}</span>
              {alert.triggeredAt ? <Pill tone="positive">Ausgelöst</Pill> : <Pill tone="neutral">Aktiv</Pill>}
              {alert.triggeredAt && <button className="button button-ghost alert-reset" onClick={() => resetAlert(alert.id)}>Reset</button>}
              <button className="row-delete" onClick={() => removeAlert((item) => item.id === alert.id, `Alarm „${alert.symbol}“`)} aria-label={`Alarm für ${alert.symbol} entfernen`}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      ) : <EmptyState title="Keine Alarme" icon={<Bell size={20} />}>Lege einen Schwellenwert für ein Asset fest – Markierung in der App, optional eine Browser-Benachrichtigung.</EmptyState>}
      <p className="small-status alert-caveat">Funktioniert nur, solange dieser Tab geöffnet ist und aktualisiert wird – es gibt keinen Hintergrunddienst.</p>
    </InfoCard>
  )
}
