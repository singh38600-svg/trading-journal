import React from 'react'

function BiasColor({ bias }) {
  if (bias === 'BULLISH') return <span className="bull font-bold">{bias}</span>
  if (bias === 'BEARISH') return <span className="bear font-bold">{bias}</span>
  return <span className="neutral-color font-bold">{bias}</span>
}

function SMIGauge({ value }) {
  const pct = Math.min(100, Math.max(0, value))
  const color = pct >= 70 ? '#00d26a' : pct >= 45 ? '#ffa502' : '#ff4757'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs text-gray-400">SMI</div>
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#2a2a4e" strokeWidth="8" />
          <circle cx="40" cy="40" r="30" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${pct * 1.885} 188.5`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{value}</span>
        </div>
      </div>
      <div className="text-xs text-center" style={{ color }}>
        {value >= 70 ? 'STRONG BULL' : value >= 55 ? 'MILD BULL' : value >= 45 ? 'NEUTRAL' : value >= 30 ? 'MILD BEAR' : 'STRONG BEAR'}
      </div>
    </div>
  )
}

export default function SignalCards({ signals }) {
  if (!signals) return null

  const pcr = signals.pcr || {}
  const trap = signals.trap || {}
  const sr = signals.support_resistance || {}
  const confidence = signals.confidence || 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {/* SMI */}
      <div className="card flex justify-center">
        <SMIGauge value={signals.smi || 0} />
      </div>

      {/* PCR */}
      <div className="card">
        <div className="text-xs text-gray-400 mb-2">PUT-CALL RATIO</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">OI Based</span>
            <span className={pcr.pcr_oi > 1.3 ? 'bull' : pcr.pcr_oi < 0.7 ? 'bear' : 'neutral-color'}>
              {(pcr.pcr_oi || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Volume</span>
            <span className="text-white">{(pcr.pcr_vol || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Weighted</span>
            <span className="text-white">{(pcr.weighted_pcr || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bias + Trap */}
      <div className="card">
        <div className="text-xs text-gray-400 mb-2">MARKET BIAS</div>
        <div className="text-xl mb-2"><BiasColor bias={signals.bias || 'NEUTRAL'} /></div>
        <div className="text-xs text-gray-400">Trap</div>
        <div className={trap.trap !== 'NONE' ? 'bear text-sm font-bold' : 'bull text-sm'}>
          {trap.trap || 'NONE'}
          {trap.trap !== 'NONE' && <span className="text-gray-400 text-xs ml-1">({trap.probability}%)</span>}
        </div>
      </div>

      {/* S/R + Confidence */}
      <div className="card">
        <div className="text-xs text-gray-400 mb-1">SUPPORT / RESISTANCE</div>
        <div className="flex justify-between text-sm mb-2">
          <span className="bull">{sr.support || '—'}</span>
          <span className="text-gray-400">|</span>
          <span className="bear">{sr.resistance || '—'}</span>
        </div>
        <div className="text-xs text-gray-400">Max Pain</div>
        <div className="accent text-sm font-bold mb-2">{signals.max_pain || '—'}</div>
        <div className="text-xs text-gray-400">Confidence</div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${confidence}%` }} />
        </div>
        <div className="text-xs text-right mt-1 accent">{confidence}%</div>
      </div>
    </div>
  )
}
