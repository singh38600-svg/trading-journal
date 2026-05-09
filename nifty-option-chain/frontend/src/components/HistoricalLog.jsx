const biasColor = { BULLISH: 'text-green-400', BEARISH: 'text-red-400', NEUTRAL: 'text-yellow-400' }

export function HistoricalLog({ records }) {
  if (!records?.length) {
    return (
      <div className="bg-navy-800 border border-white/5 rounded-lg p-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">Historical Log</h3>
        <p className="text-gray-600 text-xs text-center py-4">No history yet — data accumulates during market hours.</p>
      </div>
    )
  }

  return (
    <div className="bg-navy-800 border border-white/5 rounded-lg overflow-auto">
      <div className="px-4 py-2 border-b border-white/5">
        <span className="text-xs text-gray-400 uppercase tracking-widest">Historical Log</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500 border-b border-white/5">
            <th className="text-left py-1 px-3">Time</th>
            <th className="text-center py-1 px-2">Spot</th>
            <th className="text-center py-1 px-2">SMI</th>
            <th className="text-center py-1 px-2">SMI v2</th>
            <th className="text-center py-1 px-2">PCR</th>
            <th className="text-center py-1 px-2">Bias</th>
            <th className="text-center py-1 px-2">Support</th>
            <th className="text-center py-1 px-2">Resistance</th>
            <th className="text-center py-1 px-2">Trap</th>
            <th className="text-center py-1 px-2">Conf%</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-1 px-3 text-gray-400">
                {r.timestamp ? new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
              </td>
              <td className="text-center py-1 px-2">{r.spot?.toFixed(0)}</td>
              <td className={`text-center py-1 px-2 font-bold ${r.smi >= 70 ? 'text-green-400' : r.smi < 30 ? 'text-red-400' : 'text-white'}`}>
                {r.smi}
              </td>
              <td className="text-center py-1 px-2 text-accent">{r.smi_v2}</td>
              <td className="text-center py-1 px-2">{r.pcr_oi?.toFixed(2)}</td>
              <td className={`text-center py-1 px-2 font-bold ${biasColor[r.market_bias] || ''}`}>
                {r.market_bias}
              </td>
              <td className="text-center py-1 px-2 text-green-400">{r.support_strike?.toLocaleString()}</td>
              <td className="text-center py-1 px-2 text-red-400">{r.resistance_strike?.toLocaleString()}</td>
              <td className={`text-center py-1 px-2 ${r.trap_type !== 'NONE' ? 'text-orange-400 font-bold' : 'text-gray-600'}`}>
                {r.trap_type === 'NONE' ? '—' : r.trap_type?.replace('_', ' ')}
              </td>
              <td className="text-center py-1 px-2">{r.confidence}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
