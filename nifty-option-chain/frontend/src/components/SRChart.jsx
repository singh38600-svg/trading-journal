import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

export function SRChart({ strikes, spot, supportStrike, resistanceStrike, maxPain }) {
  const data = useMemo(() => {
    if (!strikes?.length) return []
    return [...strikes]
      .sort((a, b) => a.strike - b.strike)
      .map(s => ({
        strike: s.strike,
        ce_oi: Math.round(s.ce_oi / 1000),
        pe_oi: Math.round(s.pe_oi / 1000),
      }))
  }, [strikes])

  if (!data.length) return null

  return (
    <div className="bg-navy-800 border border-white/5 rounded-lg p-4">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">
        OI Distribution — Support &amp; Resistance Zones
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
          <XAxis dataKey="strike" tick={{ fill: '#888', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#888', fontSize: 10 }} unit="K" />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #3742fa33', fontSize: 11 }}
            labelStyle={{ color: '#e0e0e0' }}
          />
          {/* CE OI — red bars */}
          <Bar dataKey="ce_oi" name="CE OI (K)" radius={[2, 2, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.strike}
                fill={entry.strike === resistanceStrike ? '#ff4757' : '#ff475766'}
              />
            ))}
          </Bar>
          {/* PE OI — green bars */}
          <Bar dataKey="pe_oi" name="PE OI (K)" radius={[2, 2, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.strike}
                fill={entry.strike === supportStrike ? '#00d26a' : '#00d26a66'}
              />
            ))}
          </Bar>
          {/* Spot line */}
          {spot && (
            <ReferenceLine
              x={data.reduce((prev, curr) => Math.abs(curr.strike - spot) < Math.abs(prev.strike - spot) ? curr : prev, data[0])?.strike}
              stroke="#3742fa" strokeDasharray="4 2" strokeWidth={2}
              label={{ value: 'SPOT', fill: '#3742fa', fontSize: 10 }}
            />
          )}
          {/* Max Pain line */}
          {maxPain && (
            <ReferenceLine
              x={maxPain}
              stroke="#ffa502" strokeDasharray="4 2" strokeWidth={1.5}
              label={{ value: 'MAX PAIN', fill: '#ffa502', fontSize: 9 }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
