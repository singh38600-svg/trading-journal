// Option Chain Heatmap — CE (red gradient) left, PE (green gradient) right
// Columns: CE OI | CE OI Chg | CE Vol | CE LTP | Strike | PE LTP | PE Vol | PE OI Chg | PE OI

import { useMemo, useState } from 'react'

function heat(val, max, type) {
  if (!max || !val) return 'transparent'
  const pct  = Math.min(val / max, 1)
  const alpha = Math.round(pct * 180)
  const hex   = alpha.toString(16).padStart(2, '0')
  return type === 'ce' ? `#ff475722` : `#00d26a22`  // base; override below
}

function ceHeat(val, max) {
  if (!max || !val) return {}
  const pct = Math.min(val / max, 1)
  return { background: `rgba(255,71,87,${(pct * 0.55).toFixed(2)})` }
}

function peHeat(val, max) {
  if (!max || !val) return {}
  const pct = Math.min(val / max, 1)
  return { background: `rgba(0,210,106,${(pct * 0.55).toFixed(2)})` }
}

function buildupBadge(text) {
  const map = {
    'Long Buildup':   'text-[#00d26a] text-[9px]',
    'Short Buildup':  'text-[#ff4757] text-[9px]',
    'Short Covering': 'text-[#7bed9f] text-[9px]',
    'Long Unwinding': 'text-[#ff6b81] text-[9px]',
    'Neutral':        'text-[#8a8ab0] text-[9px]',
  }
  return <span className={map[text] || 'text-[#8a8ab0] text-[9px]'}>{text}</span>
}

function fmtOI(v) {
  if (!v) return '—'
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(v) >= 1_000)     return (v / 1_000).toFixed(0) + 'K'
  return v.toFixed(0)
}

function fmtChg(v) {
  if (!v) return '—'
  const sign = v > 0 ? '+' : ''
  if (Math.abs(v) >= 1_000_000) return sign + (v / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(v) >= 1_000)     return sign + (v / 1_000).toFixed(0) + 'K'
  return sign + v.toFixed(0)
}

export default function OptionChainHeatmap({ strikes = [], signals = {}, spot = 0 }) {
  const [filterAtm, setFilterAtm] = useState(false)

  const maxCeOI = useMemo(() => Math.max(...strikes.map(s => s.ce?.oi || 0), 1), [strikes])
  const maxPeOI = useMemo(() => Math.max(...strikes.map(s => s.pe?.oi || 0), 1), [strikes])

  const displayed = filterAtm
    ? strikes.filter(s => Math.abs(s.strike - spot) <= 500)
    : strikes

  return (
    <div className="mx-6 mb-4 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a4a]">
        <div className="text-xs text-[#8a8ab0] tracking-widest uppercase font-mono">Option Chain Heatmap</div>
        <div className="flex gap-3 items-center">
          <span className="text-[10px] font-mono text-[#8a8ab0]">
            R: <span className="text-[#ff4757] font-bold">{signals.resistance}</span>
            &nbsp;&nbsp;S: <span className="text-[#00d26a] font-bold">{signals.support}</span>
          </span>
          <button
            onClick={() => setFilterAtm(f => !f)}
            className={`text-[10px] px-2 py-1 rounded font-mono border transition-colors ${
              filterAtm
                ? 'bg-[#3742fa] border-[#3742fa] text-white'
                : 'border-[#2a2a4a] text-[#8a8ab0] hover:text-white'
            }`}
          >
            {filterAtm ? 'ATM ±500' : 'All Strikes'}
          </button>
        </div>
      </div>

      {/* Column labels */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono border-collapse min-w-[700px]">
          <thead>
            <tr className="text-[#8a8ab0] text-[10px] border-b border-[#2a2a4a]">
              {/* CE side */}
              <th className="px-2 py-2 text-right text-[#ff4757]">CE OI</th>
              <th className="px-2 py-2 text-right text-[#ff4757]">OI Chg</th>
              <th className="px-2 py-2 text-right">Volume</th>
              <th className="px-2 py-2 text-right">LTP</th>
              <th className="px-2 py-2 text-right text-[#8a8ab0]">IV%</th>
              {/* Strike */}
              <th className="px-3 py-2 text-center bg-[#0a0a1a] text-white text-[11px]">STRIKE</th>
              {/* PE side */}
              <th className="px-2 py-2 text-left text-[#8a8ab0]">IV%</th>
              <th className="px-2 py-2 text-left">LTP</th>
              <th className="px-2 py-2 text-left">Volume</th>
              <th className="px-2 py-2 text-left text-[#00d26a]">OI Chg</th>
              <th className="px-2 py-2 text-left text-[#00d26a]">PE OI</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row) => {
              const ce = row.ce || {}
              const pe = row.pe || {}
              const isAtm    = spot > 0 && Math.abs(row.strike - spot) < 60
              const isRes    = row.strike === signals.resistance
              const isSup    = row.strike === signals.support
              const isMaxPain = row.strike === signals.max_pain

              return (
                <tr
                  key={row.strike}
                  className={`chain-row border-b border-[#1a1a2e] transition-colors ${
                    isAtm ? 'bg-[#3742fa11]' : ''
                  }`}
                >
                  {/* CE OI */}
                  <td className="px-2 py-[5px] text-right" style={ceHeat(ce.oi, maxCeOI)}>
                    <div className="font-bold text-[#ff6b81]">{fmtOI(ce.oi)}</div>
                    <div className="text-[9px] text-[#8a8ab0]">{ce.zone_strength || ''}</div>
                  </td>
                  {/* CE OI Chg */}
                  <td className={`px-2 py-[5px] text-right ${(ce.oich || 0) > 0 ? 'text-[#ff4757]' : 'text-[#7bed9f]'}`}>
                    <div>{fmtChg(ce.oich)}</div>
                    <div className="text-[8px]">{buildupBadge(ce.buildup)}</div>
                  </td>
                  {/* CE Volume */}
                  <td className="px-2 py-[5px] text-right text-[#e0e0e0]">{fmtOI(ce.volume)}</td>
                  {/* CE LTP */}
                  <td className={`px-2 py-[5px] text-right font-bold ${(ce.ltpch || 0) >= 0 ? 'text-[#00d26a]' : 'text-[#ff4757]'}`}>
                    {ce.ltp ? ce.ltp.toFixed(1) : '—'}
                  </td>
                  {/* CE IV */}
                  <td className="px-2 py-[5px] text-right text-[#8a8ab0]">{ce.iv || '—'}</td>

                  {/* STRIKE */}
                  <td className={`px-3 py-[5px] text-center font-bold text-[11px] bg-[#0a0a1a] ${
                    isAtm ? 'text-[#ffa502] border-l border-r border-[#ffa50244]' :
                    isRes ? 'text-[#ff4757]' :
                    isSup ? 'text-[#00d26a]' :
                    isMaxPain ? 'text-[#3742fa]' :
                    'text-white'
                  }`}>
                    {row.strike}
                    {isAtm     && <div className="text-[7px] text-[#ffa502]">ATM</div>}
                    {isRes     && <div className="text-[7px] text-[#ff4757]">RES</div>}
                    {isSup     && <div className="text-[7px] text-[#00d26a]">SUP</div>}
                    {isMaxPain && <div className="text-[7px] text-[#3742fa]">MAX PAIN</div>}
                  </td>

                  {/* PE IV */}
                  <td className="px-2 py-[5px] text-left text-[#8a8ab0]">{pe.iv || '—'}</td>
                  {/* PE LTP */}
                  <td className={`px-2 py-[5px] text-left font-bold ${(pe.ltpch || 0) >= 0 ? 'text-[#00d26a]' : 'text-[#ff4757]'}`}>
                    {pe.ltp ? pe.ltp.toFixed(1) : '—'}
                  </td>
                  {/* PE Volume */}
                  <td className="px-2 py-[5px] text-left text-[#e0e0e0]">{fmtOI(pe.volume)}</td>
                  {/* PE OI Chg */}
                  <td className={`px-2 py-[5px] text-left ${(pe.oich || 0) > 0 ? 'text-[#00d26a]' : 'text-[#ff6b81]'}`}>
                    <div>{fmtChg(pe.oich)}</div>
                    <div className="text-[8px]">{buildupBadge(pe.buildup)}</div>
                  </td>
                  {/* PE OI */}
                  <td className="px-2 py-[5px] text-left" style={peHeat(pe.oi, maxPeOI)}>
                    <div className="font-bold text-[#7bed9f]">{fmtOI(pe.oi)}</div>
                    <div className="text-[9px] text-[#8a8ab0]">{pe.zone_strength || ''}</div>
                  </td>
                </tr>
              )
            })}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-12 text-[#8a8ab0] font-mono text-sm">
                  No data — connect Fyers to load option chain
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
