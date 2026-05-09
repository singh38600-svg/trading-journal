import React, { useState } from 'react'

function heatColor(oi, maxOi, type) {
  if (!maxOi || !oi) return 'transparent'
  const intensity = Math.round((oi / maxOi) * 255)
  return type === 'CE'
    ? `rgba(255, 71, 87, ${oi / maxOi * 0.85})`
    : `rgba(0, 210, 106, ${oi / maxOi * 0.85})`
}

function BuildupBadge({ type }) {
  const colors = {
    'Long Buildup': 'bg-green-900 text-green-300',
    'Short Buildup': 'bg-red-900 text-red-300',
    'Short Covering': 'bg-blue-900 text-blue-300',
    'Long Unwinding': 'bg-yellow-900 text-yellow-300',
  }
  return (
    <span className={`text-xs px-1 py-0.5 rounded ${colors[type] || 'bg-gray-800 text-gray-400'}`}>
      {type?.split(' ')[0]}
    </span>
  )
}

export default function OptionChainHeatmap({ signals }) {
  const [filter, setFilter] = useState('ATM')

  if (!signals?.chain) return (
    <div className="card mb-4 text-center text-gray-500 py-8">
      Waiting for data...
    </div>
  )

  const chain = signals.chain
  const spot = signals.spot || 0
  const resistance = signals.support_resistance?.resistance || 0
  const support = signals.support_resistance?.support || 0
  const maxPain = signals.max_pain || 0

  const ceMap = {}
  const peMap = {}
  chain.forEach(r => {
    if (r.option_type === 'CE') ceMap[r.strike_price] = r
    else peMap[r.strike_price] = r
  })

  const allStrikes = [...new Set(chain.map(r => r.strike_price))].sort((a, b) => a - b)

  let displayStrikes = allStrikes
  if (filter === 'ATM') {
    const atmIdx = allStrikes.reduce((best, s, i) =>
      Math.abs(s - spot) < Math.abs(allStrikes[best] - spot) ? i : best, 0)
    displayStrikes = allStrikes.slice(Math.max(0, atmIdx - 10), atmIdx + 11)
  }

  const maxCeOi = Math.max(...allStrikes.map(s => ceMap[s]?.oi || 0), 1)
  const maxPeOi = Math.max(...allStrikes.map(s => peMap[s]?.oi || 0), 1)

  const fmt = n => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : n

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-300">OPTION CHAIN HEATMAP</h2>
        <div className="flex gap-2">
          {['ATM', 'ALL'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-2 py-1 rounded ${filter === f ? 'bg-accent text-white' : 'bg-gray-800 text-gray-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="text-right pr-2 py-1">CE OI</th>
              <th className="text-right pr-2">CE Chg</th>
              <th className="text-right pr-2">CE Vol</th>
              <th className="text-right pr-2">CE LTP</th>
              <th className="text-right pr-2">CE IV</th>
              <th className="text-right pr-2">CE Build</th>
              <th className="text-center py-1 font-bold text-white">STRIKE</th>
              <th className="text-left pl-2">PE Build</th>
              <th className="text-left pl-2">PE IV</th>
              <th className="text-left pl-2">PE LTP</th>
              <th className="text-left pl-2">PE Vol</th>
              <th className="text-left pl-2">PE Chg</th>
              <th className="text-left pl-2">PE OI</th>
            </tr>
          </thead>
          <tbody>
            {displayStrikes.map(strike => {
              const ce = ceMap[strike] || {}
              const pe = peMap[strike] || {}
              const isAtm = Math.abs(strike - spot) < 50
              const isRes = strike === resistance
              const isSup = strike === support
              const isMp = strike === maxPain

              let rowStyle = {}
              if (isAtm) rowStyle = { borderLeft: '2px solid #3742fa', borderRight: '2px solid #3742fa' }
              if (isRes) rowStyle = { ...rowStyle, borderTop: '2px solid #ff4757' }
              if (isSup) rowStyle = { ...rowStyle, borderBottom: '2px solid #00d26a' }

              return (
                <tr key={strike} style={rowStyle}
                  className={`border-b border-gray-900 ${isAtm ? 'bg-blue-950/30' : ''}`}>
                  {/* CE side */}
                  <td className="text-right pr-2 py-1 font-mono"
                    style={{ background: heatColor(ce.oi, maxCeOi, 'CE') }}>
                    {fmt(ce.oi || 0)}
                  </td>
                  <td className={`text-right pr-2 ${(ce.oich || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {(ce.oich || 0) > 0 ? '+' : ''}{fmt(ce.oich || 0)}
                  </td>
                  <td className="text-right pr-2 text-gray-400">{fmt(ce.volume || 0)}</td>
                  <td className="text-right pr-2 text-white">{(ce.ltp || 0).toFixed(1)}</td>
                  <td className="text-right pr-2 text-gray-400">{ce.iv || 0}%</td>
                  <td className="text-right pr-2">
                    {ce.buildup && <BuildupBadge type={ce.buildup} />}
                  </td>

                  {/* Strike */}
                  <td className={`text-center font-bold px-2 ${isAtm ? 'accent' : isRes ? 'bear' : isSup ? 'bull' : 'text-white'}`}>
                    {strike}
                    {isAtm && <span className="ml-1 text-xs text-blue-400">ATM</span>}
                    {isRes && <span className="ml-1 text-xs bear">R</span>}
                    {isSup && <span className="ml-1 text-xs bull">S</span>}
                    {isMp && <span className="ml-1 text-xs accent">MP</span>}
                  </td>

                  {/* PE side */}
                  <td className="text-left pl-2">
                    {pe.buildup && <BuildupBadge type={pe.buildup} />}
                  </td>
                  <td className="text-left pl-2 text-gray-400">{pe.iv || 0}%</td>
                  <td className="text-left pl-2 text-white">{(pe.ltp || 0).toFixed(1)}</td>
                  <td className="text-left pl-2 text-gray-400">{fmt(pe.volume || 0)}</td>
                  <td className={`text-left pl-2 ${(pe.oich || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(pe.oich || 0) > 0 ? '+' : ''}{fmt(pe.oich || 0)}
                  </td>
                  <td className="text-left pl-2 font-mono"
                    style={{ background: heatColor(pe.oi, maxPeOi, 'PE') }}>
                    {fmt(pe.oi || 0)}
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
