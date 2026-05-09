import { useMemo } from 'react'

function heatClass(oi, maxOi, side) {
  if (maxOi === 0 || oi === 0) return ''
  const pct = oi / maxOi
  const level = pct > 0.8 ? 5 : pct > 0.6 ? 4 : pct > 0.4 ? 3 : pct > 0.2 ? 2 : 1
  return `${side}-heat-${level}`
}

const buildupColor = {
  LONG_BUILDUP: 'text-green-400',
  SHORT_BUILDUP: 'text-red-400',
  SHORT_COVERING: 'text-yellow-400',
  LONG_UNWINDING: 'text-orange-400',
}

const buildupShort = {
  LONG_BUILDUP: 'LB',
  SHORT_BUILDUP: 'SB',
  SHORT_COVERING: 'SC',
  LONG_UNWINDING: 'LU',
}

export function OptionChainHeatmap({ strikes, spot, supportStrike, resistanceStrike }) {
  const maxCeOi = useMemo(() => Math.max(...strikes.map(s => s.ce_oi), 1), [strikes])
  const maxPeOi = useMemo(() => Math.max(...strikes.map(s => s.pe_oi), 1), [strikes])

  // Sort strikes descending so highest is at top
  const sorted = useMemo(() => [...strikes].sort((a, b) => b.strike - a.strike), [strikes])

  return (
    <div className="bg-navy-800 border border-white/5 rounded-lg overflow-auto">
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Option Chain Heatmap</span>
        <div className="flex gap-4 text-xs">
          <span className="text-green-400">■ Long Buildup</span>
          <span className="text-red-400">■ Short Buildup</span>
          <span className="text-yellow-400">■ Short Covering</span>
          <span className="text-orange-400">■ Long Unwinding</span>
        </div>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-gray-500 border-b border-white/5">
            {/* CE side */}
            <th className="text-right py-1 px-2 text-red-400">CE OI</th>
            <th className="text-right py-1 px-2 text-red-400">Chg</th>
            <th className="text-right py-1 px-2 text-red-400">Vol</th>
            <th className="text-right py-1 px-2 text-red-400">LTP</th>
            <th className="text-right py-1 px-2 text-red-400">IV%</th>
            <th className="text-right py-1 px-2 text-red-400">Type</th>
            {/* Strike */}
            <th className="text-center py-1 px-3 text-white font-bold">STRIKE</th>
            {/* PE side */}
            <th className="text-left py-1 px-2 text-green-400">Type</th>
            <th className="text-left py-1 px-2 text-green-400">IV%</th>
            <th className="text-left py-1 px-2 text-green-400">LTP</th>
            <th className="text-left py-1 px-2 text-green-400">Vol</th>
            <th className="text-left py-1 px-2 text-green-400">Chg</th>
            <th className="text-left py-1 px-2 text-green-400">PE OI</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const isAtm = spot && Math.abs(s.strike - spot) < 50
            const isSupport = s.strike === supportStrike
            const isResistance = s.strike === resistanceStrike
            const rowBg = isAtm ? 'bg-accent/10' : ''

            return (
              <tr key={s.strike} className={`border-b border-white/5 hover:bg-white/5 ${rowBg}`}>
                {/* CE OI */}
                <td className={`text-right py-1 px-2 ${heatClass(s.ce_oi, maxCeOi, 'ce')}`}>
                  {(s.ce_oi / 1000).toFixed(0)}K
                </td>
                <td className={`text-right py-1 px-2 ${s.ce_oi_change > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {s.ce_oi_change > 0 ? '+' : ''}{(s.ce_oi_change / 1000).toFixed(0)}K
                </td>
                <td className="text-right py-1 px-2 text-gray-400">{(s.ce_volume / 1000).toFixed(0)}K</td>
                <td className="text-right py-1 px-2">{s.ce_ltp.toFixed(1)}</td>
                <td className="text-right py-1 px-2 text-gray-400">{s.ce_iv.toFixed(1)}</td>
                <td className={`text-right py-1 px-2 font-bold ${buildupColor[s.ce_buildup] || ''}`}>
                  {buildupShort[s.ce_buildup] || '-'}
                </td>

                {/* Strike */}
                <td className={`text-center py-1 px-3 font-bold text-sm ${
                  isAtm ? 'text-accent' :
                  isResistance ? 'text-red-400' :
                  isSupport ? 'text-green-400' : 'text-white'
                }`}>
                  {s.strike.toLocaleString()}
                  {isAtm && <span className="ml-1 text-accent text-xs">ATM</span>}
                  {isResistance && <span className="ml-1 text-red-400 text-xs">R</span>}
                  {isSupport && <span className="ml-1 text-green-400 text-xs">S</span>}
                </td>

                {/* PE side */}
                <td className={`text-left py-1 px-2 font-bold ${buildupColor[s.pe_buildup] || ''}`}>
                  {buildupShort[s.pe_buildup] || '-'}
                </td>
                <td className="text-left py-1 px-2 text-gray-400">{s.pe_iv.toFixed(1)}</td>
                <td className="text-left py-1 px-2">{s.pe_ltp.toFixed(1)}</td>
                <td className="text-left py-1 px-2 text-gray-400">{(s.pe_volume / 1000).toFixed(0)}K</td>
                <td className={`text-left py-1 px-2 ${s.pe_oi_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {s.pe_oi_change > 0 ? '+' : ''}{(s.pe_oi_change / 1000).toFixed(0)}K
                </td>
                <td className={`text-left py-1 px-2 ${heatClass(s.pe_oi, maxPeOi, 'pe')}`}>
                  {(s.pe_oi / 1000).toFixed(0)}K
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
