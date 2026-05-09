export function FuturesPanel({ futures, rolloverPct, volRatio, spot }) {
  if (!futures) return null

  const buildupColor = {
    LONG_BUILDUP: 'text-green-400',
    SHORT_BUILDUP: 'text-red-400',
    SHORT_COVERING: 'text-yellow-400',
    LONG_UNWINDING: 'text-orange-400',
  }

  const premiumColor = futures.premium > 0 ? 'text-green-400' : 'text-red-400'
  const trendColor = futures.premium_trend === 'EXPANDING' ? 'text-green-400' :
                     futures.premium_trend === 'SHRINKING' ? 'text-red-400' : 'text-yellow-400'

  return (
    <div className="bg-navy-800 border border-white/5 rounded-lg p-4">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">Futures Panel</h3>
      <div className="space-y-2">
        <Row label="Buildup">
          <span className={`font-bold ${buildupColor[futures.buildup] || 'text-white'}`}>
            {futures.buildup?.replace('_', ' ')}
          </span>
        </Row>
        <Row label="Premium">
          <span className={`font-bold ${premiumColor}`}>
            {futures.premium > 0 ? '+' : ''}{futures.premium?.toFixed(2)}
          </span>
        </Row>
        <Row label="Prem Trend">
          <span className={`font-bold ${trendColor}`}>{futures.premium_trend}</span>
        </Row>
        <Row label="Score">
          <span className="font-bold text-accent">{futures.futures_score}/100</span>
        </Row>
        <Row label="Rollover">
          <span className="font-bold text-white">{rolloverPct}%</span>
        </Row>
        <Row label="Vol Ratio">
          <span className={`font-bold ${volRatio > 1.5 ? 'text-yellow-400' : volRatio < 0.5 ? 'text-red-400' : 'text-white'}`}>
            {volRatio}×
          </span>
        </Row>
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className="text-xs">{children}</span>
    </div>
  )
}
