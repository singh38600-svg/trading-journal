import React from 'react'

export default function SignalsPanel({ signals }) {
  if (!signals) return null

  const spikes = signals.oi_spikes || []
  const aggressive = signals.aggressive_writing || []
  const breakout = signals.breakout || {}
  const reversal = signals.reversal || {}
  const netFlow = signals.net_oi_flow || {}
  const gamma = signals.gamma_exposure || []
  const liquidity = signals.liquidity || []

  return (
    <div className="card mb-4">
      <h2 className="text-sm font-bold text-gray-300 mb-3">SIGNALS PANEL</h2>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Breakout</span>
          <span className={breakout.breakout ? 'bull font-bold' : 'text-gray-500'}>
            {breakout.breakout ? '✅ CONFIRMED' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Reversal</span>
          <span className={reversal.reversal ? 'neutral-color font-bold' : 'text-gray-500'}>
            {reversal.reversal ? '⚡ ALERT' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Net OI Flow</span>
          <span className={netFlow.direction === 'BULLISH' ? 'bull' : 'bear'}>
            {netFlow.direction || '—'} ({netFlow.net_flow > 0 ? '+' : ''}{(netFlow.net_flow || 0).toLocaleString()})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Aggressive Writing</span>
          <span className={aggressive.length ? 'bear' : 'text-gray-500'}>
            {aggressive.length ? `${aggressive.length} strikes` : 'None'}
          </span>
        </div>
      </div>

      {spikes.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">⚡ OI SPIKES (Scalping)</div>
          {spikes.map((s, i) => (
            <div key={i} className="bg-gray-900 rounded p-2 mb-1 text-xs">
              <span className="bear font-bold">{s.strike} {s.option_type}</span>
              <span className="text-gray-400 mx-1">|</span>
              <span className={s.oi_change > 0 ? 'bull' : 'bear'}>{s.oi_change > 0 ? '+' : ''}{s.oi_change.toLocaleString()}</span>
              <span className="text-gray-400 mx-1">|</span>
              <span className="neutral-color">{s.buildup}</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="accent">{s.action}</span>
            </div>
          ))}
        </div>
      )}

      {aggressive.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">AGGRESSIVE WRITING</div>
          {aggressive.slice(0, 3).map((a, i) => (
            <div key={i} className="bg-gray-900 rounded p-1 mb-1 text-xs">
              <span className="bear">{a.strike} {a.option_type}</span>
              <span className="text-gray-400 mx-1">Vol: {a.volume.toLocaleString()}</span>
              <span className="bear">OI+{a.oi_change.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-gray-500 mb-1">TOP GAMMA EXPOSURE</div>
          {gamma.slice(0, 3).map((g, i) => (
            <div key={i} className="text-xs flex justify-between">
              <span className="text-gray-300">{g.strike} {g.option_type}</span>
              <span className="accent">{(g.gamma_exposure / 1000).toFixed(0)}K</span>
            </div>
          ))}
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">TOP LIQUIDITY</div>
          {liquidity.slice(0, 3).map((l, i) => (
            <div key={i} className="text-xs flex justify-between">
              <span className="text-gray-300">{l.strike}</span>
              <span className="bull">{l.liquidity_score.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
