// Historical log table — Time | SMI | PCR | Bias | S | R | Trap

import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function biasColor(b) {
  if (b === 'BULLISH') return 'text-[#00d26a]'
  if (b === 'BEARISH') return 'text-[#ff4757]'
  return 'text-[#ffa502]'
}

function smiColor(s) {
  if (s >= 70) return 'text-[#00d26a]'
  if (s >= 55) return 'text-[#7bed9f]'
  if (s >= 45) return 'text-[#ffa502]'
  return 'text-[#ff4757]'
}

function fmtTime(ts) {
  if (!ts) return '—'
  try {
    const d = new Date(ts)
    return d.toLocaleString('en-IN', {
      month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  } catch { return ts }
}

export default function HistoricalLog() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(false)
  const [days, setDays]     = useState(3)

  const load = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/history?days=${days}`)
      const json = await res.json()
      setRows(json.history || [])
    } catch (_) {}
    setLoading(false)
  }

  useEffect(() => { load() }, [days])

  return (
    <div className="mx-6 mb-6 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a4a]">
        <div className="text-[10px] text-[#8a8ab0] tracking-widest uppercase font-mono">Historical Log</div>
        <div className="flex gap-2 items-center">
          {[1, 3, 7].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-[10px] px-2 py-1 rounded font-mono border transition-colors ${
                days === d
                  ? 'bg-[#3742fa] border-[#3742fa] text-white'
                  : 'border-[#2a2a4a] text-[#8a8ab0] hover:text-white'
              }`}
            >
              {d}d
            </button>
          ))}
          <button
            onClick={load}
            className="text-[10px] px-2 py-1 rounded font-mono border border-[#2a2a4a] text-[#8a8ab0] hover:text-white"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse min-w-[600px]">
          <thead>
            <tr className="text-[#8a8ab0] text-[10px] border-b border-[#2a2a4a]">
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-right">Spot</th>
              <th className="px-3 py-2 text-right">SMI</th>
              <th className="px-3 py-2 text-right">PCR</th>
              <th className="px-3 py-2 text-center">Bias</th>
              <th className="px-3 py-2 text-right">Support</th>
              <th className="px-3 py-2 text-right">Resistance</th>
              <th className="px-3 py-2 text-right">Max Pain</th>
              <th className="px-3 py-2 text-center">Trap</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#8a8ab0]">Loading...</td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#8a8ab0]">
                  No historical data yet — data is stored as the market runs.
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const sig = row.signals || {}
              return (
                <tr key={i} className="chain-row border-b border-[#1a1a2e]">
                  <td className="px-3 py-2 text-[#8a8ab0]">{fmtTime(row.timestamp)}</td>
                  <td className="px-3 py-2 text-right text-white">
                    {row.spot ? `₹${Number(row.spot).toLocaleString('en-IN', {minimumFractionDigits: 0})}` : '—'}
                  </td>
                  <td className={`px-3 py-2 text-right font-bold ${smiColor(sig.smi)}`}>
                    {sig.smi ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-white">{sig.pcr_oi?.toFixed(2) ?? '—'}</td>
                  <td className={`px-3 py-2 text-center font-bold ${biasColor(sig.bias)}`}>
                    {sig.bias || '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-[#00d26a]">{sig.support || '—'}</td>
                  <td className="px-3 py-2 text-right text-[#ff4757]">{sig.resistance || '—'}</td>
                  <td className="px-3 py-2 text-right text-[#ffa502]">{sig.max_pain || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    {sig.trap_type
                      ? <span className="text-[#ffa502]">⚠ {sig.trap_type}</span>
                      : <span className="text-[#8a8ab0]">—</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
