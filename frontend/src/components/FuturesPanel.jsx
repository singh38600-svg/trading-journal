// Futures data panel — premium, buildup, volume ratio, divergence alert

function Row({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[#2a2a4a] last:border-0">
      <span className="text-[10px] text-[#8a8ab0] font-mono uppercase tracking-wider">{label}</span>
      <span className={`font-mono text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  )
}

function buildupColor(b) {
  if (b === 'Long Buildup')   return 'text-[#00d26a]'
  if (b === 'Short Buildup')  return 'text-[#ff4757]'
  if (b === 'Short Covering') return 'text-[#7bed9f]'
  if (b === 'Long Unwinding') return 'text-[#ff6b81]'
  return 'text-[#8a8ab0]'
}

export default function FuturesPanel({ futures = {}, futuresSig = {} }) {
  const {
    ltp = 0, oi = 0, oich = 0, volume = 0, day_high = 0, day_low = 0,
  } = futures

  const {
    buildup = '', premium = 0, premium_trend = '', divergence = null,
    smi_v2 = 0, vol_ratio = 1,
  } = futuresSig

  const premiumColor = premium > 0 ? 'text-[#00d26a]' : premium < 0 ? 'text-[#ff4757]' : 'text-[#8a8ab0]'
  const trendColor   = premium_trend === 'Expanding' ? 'text-[#00d26a]' : premium_trend === 'Shrinking' ? 'text-[#ff4757]' : 'text-[#ffa502]'
  const volColor     = vol_ratio >= 1.5 ? 'text-[#ffa502]' : vol_ratio <= 0.5 ? 'text-[#ff4757]' : 'text-white'

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-4">
      <div className="text-[10px] text-[#8a8ab0] tracking-widest uppercase font-mono mb-3">Futures Panel</div>

      {/* Divergence — most important, shown prominently */}
      {divergence && (
        <div className="mb-3 p-2 rounded-lg border border-[#ffa50244] bg-[#ffa50211] text-[11px] text-[#ffa502] font-mono">
          🔥 {divergence}
        </div>
      )}

      <Row label="Futures LTP"  value={ltp ? `₹${ltp.toLocaleString('en-IN')}` : '—'} />
      <Row
        label="Buildup"
        value={buildup || '—'}
        valueClass={buildupColor(buildup)}
      />
      <Row
        label="Premium"
        value={premium ? `${premium > 0 ? '+' : ''}₹${premium.toFixed(1)}` : '—'}
        valueClass={premiumColor}
      />
      <Row
        label="Premium Trend"
        value={premium_trend || '—'}
        valueClass={trendColor}
      />
      <Row
        label="Vol Ratio (5d)"
        value={vol_ratio ? vol_ratio.toFixed(2) + 'x' : '—'}
        valueClass={volColor}
      />
      <Row label="OI Change"   value={oich ? (oich > 0 ? '+' : '') + (oich / 1000).toFixed(0) + 'K' : '—'} />
      <Row label="Day High"    value={day_high ? `₹${day_high.toLocaleString('en-IN')}` : '—'} />
      <Row label="Day Low"     value={day_low  ? `₹${day_low.toLocaleString('en-IN')}`  : '—'} />
      <Row
        label="Combined SMI v2"
        value={smi_v2 ? `${smi_v2}/100` : '—'}
        valueClass={smi_v2 >= 70 ? 'text-[#00d26a]' : smi_v2 >= 45 ? 'text-[#ffa502]' : 'text-[#ff4757]'}
      />
    </div>
  )
}
