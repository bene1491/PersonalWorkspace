import { useMemo, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowLeft, BookmarkPlus, ExternalLink, PieChart as PieChartIcon, Plus, RefreshCw, TrendingDown, TrendingUp, Trash2, Wallet } from 'lucide-react'
import { CurrencyConverter } from '../components/CurrencyConverter'
import { FearGreedWidget } from '../components/FearGreedWidget'
import { PriceAlerts } from '../components/PriceAlerts'
import { Sparkline } from '../components/Sparkline'
import { EmptyState, InfoCard, Notice, Pill, SectionHeading } from '../components/ui'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useMarketData } from '../hooks/useMarketData'
import { useUndoableRemove } from '../hooks/useUndoableRemove'
import type { JournalEntry, MarketAsset, PortfolioHolding } from '../types'

const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
const bigMoney = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, notation: 'compact' })
const quantityFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 6 })
const timestamp = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' })
const ALLOCATION_COLORS = ['var(--accent)', 'var(--positive)', 'var(--warning)', 'var(--accent-strong)', 'var(--negative)', 'var(--text-secondary)']

function usePortfolioStats(holdings: PortfolioHolding[], data: MarketAsset[]) {
  return useMemo(() => {
    const rows = holdings.map((holding) => {
      const asset = data.find((entry) => entry.id === holding.assetId)
      const currentPrice = asset?.price ?? null
      const currentValue = currentPrice !== null ? currentPrice * holding.quantity : null
      const costBasis = holding.buyPrice * holding.quantity
      const pnl = currentValue !== null ? currentValue - costBasis : null
      const pnlPercent = costBasis > 0 && pnl !== null ? (pnl / costBasis) * 100 : null
      return { holding, asset, currentPrice, currentValue, costBasis, pnl, pnlPercent }
    })
    const totalValue = rows.reduce((sum, row) => sum + (row.currentValue ?? 0), 0)
    const totalCost = rows.reduce((sum, row) => sum + row.costBasis, 0)
    const totalPnl = totalValue - totalCost
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : null
    const allocation = rows
      .filter((row): row is typeof row & { currentValue: number } => row.currentValue !== null && row.currentValue > 0)
      .map((row) => ({ symbol: row.holding.symbol, value: row.currentValue, percent: totalValue > 0 ? (row.currentValue / totalValue) * 100 : 0 }))
      .sort((a, b) => b.value - a.value)
    return { rows, totalValue, totalCost, totalPnl, totalPnlPercent, allocation }
  }, [holdings, data])
}

export function Finance() {
  const navigate = useNavigate()
  const { data, status, error, refresh } = useMarketData()
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('personal-workspace.watchlist.v1', [])
  const [journal, setJournal] = useLocalStorage<JournalEntry[]>('personal-workspace.investment-journal.v1', [])
  const [journalOpen, setJournalOpen] = useState(false)
  const [journalTitle, setJournalTitle] = useState('')
  const [journalBody, setJournalBody] = useState('')
  const [symbol, setSymbol] = useState('')
  const [holdings, setHoldings] = useLocalStorage<PortfolioHolding[]>('personal-workspace.portfolio.v1', [])
  const [assetId, setAssetId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const removeWatchlistItem = useUndoableRemove(watchlist, setWatchlist)
  const removeJournalEntry = useUndoableRemove(journal, setJournal)
  const removeHolding = useUndoableRemove(holdings, setHoldings)
  const portfolio = usePortfolioStats(holdings, data)

  function addHolding(event: React.FormEvent) {
    event.preventDefault()
    const asset = data.find((entry) => entry.id === assetId)
    const qty = Number(quantity.replace(',', '.'))
    const price = Number(buyPrice.replace(',', '.'))
    if (!asset || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price < 0) return
    setHoldings((items) => [{ id: crypto.randomUUID(), assetId: asset.id, symbol: asset.symbol, quantity: qty, buyPrice: price, createdAt: new Date().toISOString() }, ...items])
    setQuantity('')
    setBuyPrice('')
  }

  function addWatchlist() {
    const cleaned = symbol.trim().toLocaleUpperCase('de-DE')
    if (cleaned && !watchlist.includes(cleaned)) setWatchlist((items) => [...items, cleaned])
    setSymbol('')
  }

  function addJournal(event: React.FormEvent) {
    event.preventDefault()
    if (!journalTitle.trim()) return
    setJournal((items) => [{ id: crypto.randomUUID(), title: journalTitle.trim(), body: journalBody.trim(), createdAt: new Date().toISOString() }, ...items])
    setJournalTitle('')
    setJournalBody('')
    setJournalOpen(false)
  }

  return <>
    <SectionHeading eyebrow="Finanzen" title="Markt & Portfolio" description="Öffentliche Marktdaten, persönliche Listen und ein lokales Investment-Journal." action={<button className="button button-primary" onClick={() => setJournalOpen(!journalOpen)}><BookmarkPlus size={16} /> Journaleintrag</button>} />
    <Notice title="Kein Broker verbunden" variant="secure">Es gibt keinen Portfolioimport, keine Kontoverbindung und keine Handelsfunktion. Werte werden erst angezeigt, wenn du sie selbst im Workspace pflegst.</Notice>
    {journalOpen && <form className="inline-form journal-form" onSubmit={addJournal}>
      <input value={journalTitle} onChange={(event) => setJournalTitle(event.target.value)} placeholder="Titel deiner Beobachtung" aria-label="Titel" autoFocus />
      <textarea value={journalBody} onChange={(event) => setJournalBody(event.target.value)} placeholder="These, Entscheidung oder Notiz (optional)" aria-label="Notiz" rows={2} />
      <div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setJournalOpen(false)}>Abbrechen</button><button className="button button-primary" type="submit">Lokal speichern</button></div>
    </form>}
    <div className="finance-summary-grid">
      <InfoCard className="portfolio-state">
        <Pill tone="neutral">Portfolio</Pill>
        {holdings.length ? <>
          <h2>{money.format(portfolio.totalValue)}</h2>
          <p className={`market-change ${portfolio.totalPnl >= 0 ? 'positive' : 'negative'}`}>
            {portfolio.totalPnl >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {portfolio.totalPnl >= 0 ? '+' : ''}{money.format(portfolio.totalPnl)}
            {portfolio.totalPnlPercent !== null && ` (${portfolio.totalPnlPercent >= 0 ? '+' : ''}${portfolio.totalPnlPercent.toFixed(1)} %)`}
          </p>
        </> : <><h2>Keine Werte erfasst</h2><p>Füge künftig manuell Bestände hinzu. Ein automatischer Import ist bewusst nicht aktiv.</p><span className="muted-metric">—</span></>}
      </InfoCard>
      <InfoCard className="portfolio-state">
        <Pill tone="neutral">Asset-Allokation</Pill>
        {portfolio.allocation.length ? <>
          <h2>{portfolio.allocation[0].symbol} · {portfolio.allocation[0].percent.toFixed(0)} %</h2>
          <p>Größte Position in deinem erfassten Portfolio.</p>
        </> : <><h2>Wartet auf Eingaben</h2><p>Die Aufteilung wird nur aus deinen später selbst angelegten Positionen berechnet.</p><span className="muted-metric">—</span></>}
      </InfoCard>
      <InfoCard className="market-source-card">
        <div className="market-card-head"><Pill tone={status === 'ready' ? 'positive' : status === 'error' ? 'warning' : 'neutral'}>{status === 'ready' ? 'Live abgerufen' : status === 'error' ? 'Abruf fehlgeschlagen' : 'Abruf läuft'}</Pill><button className="mini-icon" onClick={() => void refresh()} aria-label="Marktdaten aktualisieren"><RefreshCw size={15} /></button></div>
        <h2>Öffentliche Märkte</h2><p>Quelle: CoinGecko API · kryptobezogene Spotpreise in EUR.</p>{data[0] && <small>Zuletzt abgerufen: {timestamp.format(new Date(data[0].updatedAt))}</small>}
      </InfoCard>
      <FearGreedWidget />
    </div>
    <div className="content-grid finance-main-grid">
      <InfoCard title="Marktübersicht" className="span-8">
        {status === 'loading' && <div className="loading-panel"><span className="loader" /> Öffentliche Marktdaten werden abgerufen …</div>}
        {status === 'error' && <div className="error-panel"><strong>Keine Ersatzwerte angezeigt.</strong><span>{error}</span><button className="button button-ghost" onClick={() => void refresh()}>Erneut versuchen</button></div>}
        {status === 'ready' && <>
          <div className="markets-table" role="table" aria-label="Öffentliche Kryptowährungsdaten">
            <div className="markets-head" role="row"><span>Asset</span><span>Kurs</span><span>24 h</span><span>7 Tage</span><span /></div>
            {data.map((asset) => <div
              className="markets-row"
              role="row"
              key={asset.id}
              tabIndex={0}
              onClick={() => navigate(`/finanzen/${asset.id}`)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`/finanzen/${asset.id}`) } }}
              aria-label={`${asset.name} Details öffnen`}
            >
              <span className="asset-name"><b>{asset.symbol.slice(0, 1)}</b><span><strong>{asset.name}</strong><small>{asset.symbol}</small></span></span>
              <strong>{money.format(asset.price)}</strong>
              <span className={`market-change ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>{asset.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)} %</span>
              <Sparkline data={asset.sparkline7d} positive={asset.change24h >= 0} />
              <a className="table-action" href={`https://www.coingecko.com/en/coins/${asset.id}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} aria-label={`${asset.name} bei CoinGecko öffnen`}><ExternalLink size={15} /></a>
            </div>)}
          </div>
          <div className="chart-wrap"><div className="chart-label">Veränderung der abgerufenen Assets · 24 h</div><ResponsiveContainer width="100%" height={180}><BarChart data={data} margin={{ top: 8, right: 4, left: -25, bottom: 0 }}><XAxis dataKey="symbol" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value: number) => `${value}%`} /><Tooltip formatter={(value) => { const displayed = Array.isArray(value) ? value[0] : value; return [`${Number(displayed).toFixed(2)} %`, '24 h'] }} cursor={{ fill: 'var(--surface-muted)' }} /><Bar dataKey="change24h" radius={[5, 5, 0, 0]}>{data.map((entry) => <Cell key={entry.id} fill={entry.change24h >= 0 ? 'var(--positive)' : 'var(--negative)'} />)}</Bar></BarChart></ResponsiveContainer></div>
        </>}
      </InfoCard>
      <div className="span-4 stacked-cards">
        <InfoCard title="Watchlist">
          <form className="watchlist-form" onSubmit={(event) => { event.preventDefault(); addWatchlist() }}><input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="Ticker hinzufügen" aria-label="Ticker hinzufügen" /><button className="button button-ghost" type="submit">Hinzufügen</button></form>
          {watchlist.length ? <div className="watchlist-items">{watchlist.map((entry) => <div key={entry}><span>{entry}</span><button onClick={() => removeWatchlistItem((item) => item === entry, `Ticker „${entry}“`)} aria-label={`${entry} entfernen`}>Entfernen</button></div>)}</div> : <EmptyState title="Noch keine Watchlist" icon={<BookmarkPlus size={21} />}>Ticker werden nur lokal gespeichert. Kurse für manuelle Ticker sind noch nicht verbunden.</EmptyState>}
        </InfoCard>
        <PriceAlerts data={data} status={status} />
        <CurrencyConverter />
      </div>
    </div>
    <div className="content-grid finance-main-grid lower-grid">
      <InfoCard title="Portfolio verwalten" className="span-8">
        <form className="portfolio-form" onSubmit={addHolding}>
          <select value={assetId} onChange={(event) => setAssetId(event.target.value)} aria-label="Asset auswählen">
            <option value="">Asset wählen …</option>
            {data.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} ({asset.symbol})</option>)}
          </select>
          <input value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Menge" inputMode="decimal" aria-label="Menge" />
          <input value={buyPrice} onChange={(event) => setBuyPrice(event.target.value)} placeholder="Kaufpreis €/Stück" inputMode="decimal" aria-label="Kaufpreis pro Einheit in Euro" />
          <button className="button button-primary" type="submit" disabled={status !== 'ready'}><Plus size={15} /> Hinzufügen</button>
        </form>
        {portfolio.rows.length ? (
          <div className="portfolio-table">
            <div className="portfolio-table-head"><span>Asset</span><span>Menge</span><span>Kaufpreis</span><span>Wert</span><span>G/V</span><span /></div>
            {portfolio.rows.map((row) => (
              <div className="portfolio-table-row" key={row.holding.id}>
                <span className="asset-name"><b>{row.holding.symbol.slice(0, 1)}</b><span><strong>{row.asset?.name ?? row.holding.symbol}</strong><small>{row.holding.symbol}</small></span></span>
                <span>{quantityFormat.format(row.holding.quantity)}</span>
                <span>{money.format(row.holding.buyPrice)}</span>
                <span>{row.currentValue !== null ? money.format(row.currentValue) : '—'}</span>
                <span className={row.pnl !== null ? `market-change ${row.pnl >= 0 ? 'positive' : 'negative'}` : 'small-status'}>
                  {row.pnl !== null ? <>{row.pnl >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{row.pnl >= 0 ? '+' : ''}{money.format(row.pnl)}</> : '—'}
                </span>
                <button className="row-delete" onClick={() => removeHolding((item) => item.id === row.holding.id, `Position „${row.holding.symbol}“`)} aria-label={`Position ${row.holding.symbol} entfernen`}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        ) : <EmptyState title="Noch keine Positionen" icon={<Wallet size={21} />}>Trage Menge und Kaufpreis für eine der oben abgerufenen Kryptowährungen ein – komplett lokal, kein Broker nötig.</EmptyState>}
      </InfoCard>
      <InfoCard title="Allokation" className="span-4">
        {portfolio.allocation.length ? <>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={portfolio.allocation} dataKey="value" nameKey="symbol" innerRadius={44} outerRadius={74} paddingAngle={2} isAnimationActive={false}>
                {portfolio.allocation.map((entry, index) => <Cell key={entry.symbol} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => { const displayed = Array.isArray(value) ? value[0] : value; return [money.format(Number(displayed)), name] }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="allocation-legend">
            {portfolio.allocation.map((entry, index) => (
              <div key={entry.symbol}>
                <span className="legend-dot" style={{ '--dot-color': ALLOCATION_COLORS[index % ALLOCATION_COLORS.length] } as CSSProperties} />
                <span>{entry.symbol}</span>
                <small>{entry.percent.toFixed(1)} %</small>
              </div>
            ))}
          </div>
        </> : <EmptyState title="Noch keine Aufteilung" icon={<PieChartIcon size={21} />}>Erscheint, sobald du Positionen mit aktuellem Marktwert erfasst hast.</EmptyState>}
      </InfoCard>
    </div>
    <div className="content-grid finance-main-grid lower-grid">
      <InfoCard title="Investment-Journal" className="span-7">
        {journal.length ? <div className="journal-list">{journal.map((entry) => <article key={entry.id}><div><strong>{entry.title}</strong><small>{timestamp.format(new Date(entry.createdAt))}</small></div><p>{entry.body || 'Ohne zusätzliche Notiz.'}</p><button onClick={() => removeJournalEntry((item) => item.id === entry.id, 'Journaleintrag')}>Löschen</button></article>)}</div> : <EmptyState title="Noch keine Einträge">Halte Erkenntnisse und Entscheidungen fest – ausschließlich in deinem Browser gespeichert.</EmptyState>}
      </InfoCard>
      <InfoCard title="Screener & Nachrichten" className="span-5"><EmptyState title="Noch nicht verbunden" icon={<TrendingUp size={21} />}>Für Aktien-Screening und Nachrichten braucht es einen separaten, transparenten Datenadapter. Diese v0.1 ruft dafür keine Daten ab.</EmptyState></InfoCard>
    </div>
  </>
}

export function CoinDetail() {
  const { id } = useParams<{ id: string }>()
  const { data, status, error, refresh } = useMarketData()
  const [watchlist, setWatchlist] = useLocalStorage<string[]>('personal-workspace.watchlist.v1', [])
  const asset = data.find((entry) => entry.id === id)
  const inWatchlist = asset ? watchlist.includes(asset.symbol) : false

  return <>
    <Link to="/finanzen" className="text-link back-link"><ArrowLeft size={15} /> Zurück zur Marktübersicht</Link>
    {status === 'loading' && <div className="loading-panel"><span className="loader" /> Details werden geladen …</div>}
    {status === 'error' && <div className="error-panel"><strong>Keine Ersatzwerte angezeigt.</strong><span>{error}</span><button className="button button-ghost" onClick={() => void refresh()}>Erneut versuchen</button></div>}
    {status === 'ready' && !asset && <EmptyState title="Asset nicht in der aktuellen Auswahl" icon={<TrendingUp size={21} />}>Diese v0.1 ruft eine feste, kleine Auswahl an Kryptowährungen ab. Öffne die Marktübersicht, um ein verfügbares Asset zu wählen.</EmptyState>}
    {status === 'ready' && asset && <>
      <SectionHeading
        eyebrow="Asset-Detail"
        title={`${asset.name} (${asset.symbol})`}
        description={`Quelle: CoinGecko API · zuletzt abgerufen ${timestamp.format(new Date(asset.updatedAt))}`}
        action={<button className="button button-ghost" onClick={() => setWatchlist((items) => inWatchlist ? items.filter((entry) => entry !== asset.symbol) : [...items, asset.symbol])}><BookmarkPlus size={16} /> {inWatchlist ? 'Aus Watchlist entfernen' : 'Zur Watchlist hinzufügen'}</button>}
      />
      <div className="content-grid">
        <InfoCard className="span-8">
          <div className="detail-price-row">
            <div><span className="muted-metric detail-price">{money.format(asset.price)}</span><span className={`market-change ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>{asset.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)} % · 24 h</span></div>
            <a className="button button-ghost" href={`https://www.coingecko.com/en/coins/${asset.id}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Bei CoinGecko öffnen</a>
          </div>
          <Sparkline data={asset.sparkline7d} positive={asset.change24h >= 0} height={220} />
          <p className="small-status detail-sparkline-caption">Kursverlauf der letzten 7 Tage (stündliche Datenpunkte, bereitgestellt von CoinGecko).</p>
        </InfoCard>
        <InfoCard title="Kennzahlen" className="span-4">
          <div className="version-row"><span>24h Hoch</span><strong>{money.format(asset.high24h)}</strong></div>
          <div className="version-row"><span>24h Tief</span><strong>{money.format(asset.low24h)}</strong></div>
          <div className="version-row"><span>Marktkapitalisierung</span><strong>{bigMoney.format(asset.marketCap)}</strong></div>
          <div className="version-row"><span>Währung</span><strong>{asset.currency}</strong></div>
        </InfoCard>
      </div>
    </>}
  </>
}
