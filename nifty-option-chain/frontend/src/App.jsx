import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import { StatCard } from './components/StatCard'
import { SMIGauge } from './components/SMIGauge'
import { OptionChainHeatmap } from './components/OptionChainHeatmap'
import { FuturesPanel } from './components/FuturesPanel'
import { SignalsPanel } from './components/SignalsPanel'
import { SRChart } from './components/SRChart'
import { HistoricalLog } from './components/HistoricalLog'
import { LoginBanner } from './components/LoginBanner'

// Colour helpers
const biasColor = { BULLISH: '#00d26a', BEARISH: '#ff4757', NEUTRAL: '#ffa502' }
const smiColor = (s) => s >= 70 ? '#00d26a' : s >= 55 ? '#7bed9f' : s >= 45 ? '#ffa502' : s >= 30 ? '#ff6b81' : '#ff4757'

export default function App() {
  const { data, connected, lastUpdate } = useWebSocket()
  const [history, setHistory] = useState([])
  const [authenticated, setAuthenticated] = useState(null)
  const [expandHeatmap, setExpandHeatmap] = useState(false)

  // Check auth status on mount
  useEffect(() => {
    fetch('/api/auth/status')
      .then(r => r.json())
      .then(d => setAuthenticated(d.authenticated))
      .catch(() => setAuthenticated(false))
  }, [])

  // Fetch history periodically
  useEffect(() => {
    const load = () =>
      fetch('/api/history?limit=50')
        .then(r => r.json())
        .then(d => setHistory(d.records || []))
        .catch(() => {})
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  // Show login screen if not authenticated
  if (authenticated === false) return <LoginBanner />
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Connecting…</span>
      </div>
    )
  }

  const d = data   // shorthand
  const bias = d?.market_bias || 'NEUTRAL'
  const trap = d?.trap_type || 'NONE'

  return (
    <div className="min-h-screen bg-navy-950 text-gray-100 font-mono p-3 space-y-3">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white tracking-wider">NIFTY SMART MONEY DASHBOARD</h1>
          <p className="text-xs text-gray-500">Expiry: {d?.expiry_date || '—'} | Max Pain: {d?.max_pain?.toLocaleString() || '—'}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {lastUpdate && (
            <span className="text-gray-500">
              {lastUpdate.toLocaleTimeString('en-IN')}
            </span>
          )}
          <span className={`flex items-center gap-1 font-bold ${connected ? 'text-green-400' : 'text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* ── Top KPI Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        <SMIGauge smi={d?.smi ?? 50} label={d?.smi_label ?? 'NEUTRAL'} />
        <StatCard label="SMI v2" value={d?.smi_v2 ?? '—'} sub="/100" color={`text-[${smiColor(d?.smi_v2 ?? 50)}]`} />
        <StatCard label="Spot" value={d?.spot?.toLocaleString('en-IN') ?? '—'} sub="NSE:NIFTY" color="text-white" />
        <StatCard label="PCR (OI)" value={d?.pcr_oi?.toFixed(3) ?? '—'}
          color={d?.pcr_oi > 1.3 ? 'text-green-400' : d?.pcr_oi < 0.7 ? 'text-red-400' : 'text-yellow-400'} />
        <StatCard label="PCR (Vol)" value={d?.pcr_vol?.toFixed(3) ?? '—'} />
        <StatCard label="Market Bias" value={bias}
          color={biasColor[bias] ? `text-[${biasColor[bias]}]` : 'text-white'}
          style={{ color: biasColor[bias] }} />
        <StatCard label="Trap" value={trap === 'NONE' ? 'NONE' : `⚠️ ${trap.replace('_', ' ')}`}
          sub={trap !== 'NONE' ? `${d?.trap_probability}% probability` : ''}
          color={trap !== 'NONE' ? 'text-orange-400' : 'text-gray-500'} />
      </div>

      {/* ── Support / Resistance row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard label="Support" value={d?.support_strike?.toLocaleString() ?? '—'}
          sub={`Zone: ${d?.support_zone?.join(' / ') ?? '—'}`} color="text-green-400" />
        <StatCard label="Resistance" value={d?.resistance_strike?.toLocaleString() ?? '—'}
          sub={`Zone: ${d?.resistance_zone?.join(' / ') ?? '—'}`} color="text-red-400" />
        <StatCard label="Confidence" value={`${d?.confidence ?? '—'}%`}
          color={d?.confidence >= 70 ? 'text-green-400' : d?.confidence < 40 ? 'text-red-400' : 'text-yellow-400'} />
        <StatCard label="Net OI Flow" value={`${(d?.net_oi_flow ?? 0) > 0 ? '+' : ''}${((d?.net_oi_flow ?? 0) / 1000).toFixed(0)}K`}
          sub={d?.net_oi_flow_label}
          color={d?.net_oi_flow_label === 'BULLISH' ? 'text-green-400' : d?.net_oi_flow_label === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'} />
      </div>

      {/* ── OI Chart ─────────────────────────────────────────────────────────── */}
      <SRChart
        strikes={d?.strikes ?? []}
        spot={d?.spot}
        supportStrike={d?.support_strike}
        resistanceStrike={d?.resistance_strike}
        maxPain={d?.max_pain}
      />

      {/* ── Futures + Signals ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FuturesPanel
          futures={d?.futures}
          rolloverPct={d?.rollover_pct}
          volRatio={d?.futures_vol_ratio}
          spot={d?.spot}
        />
        <SignalsPanel data={d} />
      </div>

      {/* ── Option Chain Heatmap ─────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => setExpandHeatmap(v => !v)}
          className="mb-2 text-xs text-accent hover:text-blue-300 transition-colors"
        >
          {expandHeatmap ? '▲ Collapse' : '▼ Expand'} Option Chain Heatmap
        </button>
        {expandHeatmap && d?.strikes?.length > 0 && (
          <OptionChainHeatmap
            strikes={d.strikes}
            spot={d.spot}
            supportStrike={d.support_strike}
            resistanceStrike={d.resistance_strike}
          />
        )}
      </div>

      {/* ── Historical Log ───────────────────────────────────────────────────── */}
      <HistoricalLog records={history} />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="text-center text-xs text-gray-700 py-2">
        NIFTY Smart Money System v1.0 — For informational purposes only. Not financial advice.
      </footer>
    </div>
  )
}
