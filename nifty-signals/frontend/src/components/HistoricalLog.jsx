import React, { useEffect, useState } from 'react'

const API = import.meta.env.VITE_API_URL || '/api'

export default function HistoricalLog() {
  const [logs, setLogs] = useState([])
  const [days, setDays] = useState(1)

  useEffect(() => {
    fetch(`${API}/history?days=${days}`)
      .then(r => r.json())
      .then(data => setLogs(Array.isArray(data) ? data.slice(0, 100) : []))
      .catch(() => setLogs([]))
  }, [days])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-300">HISTORICAL LOG</h2>
        <div className="flex gap-2">
          {[1, 3, 7].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`text-xs px-2 py-1 rounded ${days === d ? 'bg-accent text-white' : 'bg-gray-800 text-gray-400'}`}>
              {d}D
            </button>
          ))}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-xs text-gray-500 text-center py-4">No history yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left py-1">Time</th>
                <th className="text-center">Spot</th>
                <th className="text-center">SMI</th>
                <th className="text-center">PCR</th>
                <th className="text-center">Bias</th>
                <th className="text-center">Support</th>
                <th className="text-center">Resist</th>
                <th className="text-center">Trap</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row, i) => {
                const bias = row.bias || ''
                const trap = row.trap?.trap || 'NONE'
                return (
                  <tr key={i} className="border-b border-gray-900 hover:bg-gray-900">
                    <td className="py-0.5 text-gray-400">
                      {(row.timestamp || '').slice(11, 16)}
                    </td>
                    <td className="text-center text-white">{row.spot || '—'}</td>
                    <td className={`text-center font-bold ${(row.smi || 0) >= 55 ? 'bull' : (row.smi || 0) >= 45 ? 'neutral-color' : 'bear'}`}>
                      {row.smi || '—'}
                    </td>
                    <td className={`text-center ${(row.pcr?.pcr_oi || 0) > 1.3 ? 'bull' : (row.pcr?.pcr_oi || 0) < 0.7 ? 'bear' : 'neutral-color'}`}>
                      {(row.pcr?.pcr_oi || 0).toFixed(2)}
                    </td>
                    <td className={`text-center ${bias === 'BULLISH' ? 'bull' : bias === 'BEARISH' ? 'bear' : 'neutral-color'}`}>
                      {bias}
                    </td>
                    <td className="text-center bull">{row.support_resistance?.support || '—'}</td>
                    <td className="text-center bear">{row.support_resistance?.resistance || '—'}</td>
                    <td className={`text-center ${trap !== 'NONE' ? 'bear font-bold' : 'text-gray-500'}`}>
                      {trap}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
