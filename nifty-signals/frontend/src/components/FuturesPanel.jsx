import React from 'react'

export default function FuturesPanel({ signals }) {
  const fut = signals?.futures || {}
  const div = signals?.futures_divergence || {}
  const smiV2 = signals?.smi_v2 || 0

  const premColor = fut.premium > 0 ? 'bull' : fut.premium < 0 ? 'bear' : 'neutral-color'
  const buildupColor = fut.buildup?.includes('Long') ? 'bull' : fut.buildup?.includes('Short Buildup') ? 'bear' : 'neutral-color'

  return (
    <div className="card mb-4">
      <h2 className="text-sm font-bold text-gray-300 mb-3">FUTURES PANEL</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-gray-500">Premium (Fut − Spot)</div>
          <div className={`font-bold ${premColor}`}>
            {fut.premium > 0 ? '+' : ''}{fut.premium || 0}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Premium Trend</div>
          <div className={fut.premium_trend === 'EXPANDING' ? 'bull' : 'bear'}>
            {fut.premium_trend || '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Buildup</div>
          <div className={`font-bold ${buildupColor}`}>{fut.buildup || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Futures Score</div>
          <div className="text-white font-bold">{fut.futures_score || 0}/100</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Day High</div>
          <div className="bull">{fut.day_high || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Day Low</div>
          <div className="bear">{fut.day_low || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">OI</div>
          <div className="text-white">{(fut.oi || 0).toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">SMI v2 (Master)</div>
          <div className={`font-bold ${smiV2 >= 55 ? 'bull' : smiV2 >= 45 ? 'neutral-color' : 'bear'}`}>
            {smiV2}/100
          </div>
        </div>
      </div>

      {div.divergence && (
        <div className="mt-3 p-2 rounded bg-red-950 border border-red-700">
          <div className="text-xs bear font-bold">🔥 FUTURES DIVERGENCE</div>
          <div className="text-xs text-gray-300 mt-1">{div.message}</div>
        </div>
      )}
    </div>
  )
}
