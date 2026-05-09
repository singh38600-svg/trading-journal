// Top-row signal cards: SMI, PCR, Bias, Max Pain, Trap, Confidence

function biasColor(bias) {
  if (bias === 'BULLISH') return 'text-[#00d26a]'
  if (bias === 'BEARISH') return 'text-[#ff4757]'
  return 'text-[#ffa502]'
}

function smiColor(smi) {
  if (smi >= 70) return '#00d26a'
  if (smi >= 55) return '#7bed9f'
  if (smi >= 45) return '#ffa502'
  if (smi >= 30) return '#ff6b81'
  return '#ff4757'
}

function SMIGauge({ smi }) {
  const color = smiColor(smi)
  const pct   = smi                  // 0-100 maps to 0-180 degrees
  const angle = (pct / 100) * 180 - 90
  const r = 38, cx = 50, cy = 50
  const toXY = (deg) => {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }
  const start = toXY(-180)
  const end   = toXY(angle - 90)
  const largeArc = pct > 50 ? 1 : 0

  return (
    <svg viewBox="0 0 100 60" className="w-24 h-14 mx-auto mt-1">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#2a2a4a" strokeWidth="8" strokeLinecap="round"
      />
      {/* Fill */}
      {pct > 0 && (
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill={color} fontFamily="monospace">
        {smi}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="6" fill="#8a8ab0">/ 100</text>
    </svg>
  )
}

function Card({ title, children, glow }) {
  return (
    <div
      className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-4 flex flex-col"
      style={glow ? { boxShadow: `0 0 20px ${glow}22` } : {}}
    >
      <div className="text-[10px] text-[#8a8ab0] tracking-widest uppercase font-mono mb-2">{title}</div>
      {children}
    </div>
  )
}

export default function SignalCards({ signals = {}, futuresSig = {} }) {
  const {
    smi = 0, smi_label = '', bias = '', pcr_oi = 0, pcr_vol = 0, weighted_pcr = 0,
    trap_type = null, trap_probability = 0, confidence = 0, max_pain = 0,
    support = 0, resistance = 0, net_oi_flow = 0,
  } = signals

  const smi_v2 = futuresSig.smi_v2 || 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-6 py-4">

      {/* SMI */}
      <Card title="Smart Money Index" glow={smiColor(smi)}>
        <SMIGauge smi={smi} />
        <div className="text-center text-xs font-semibold mt-1" style={{ color: smiColor(smi) }}>
          {smi_label || '—'}
        </div>
        <div className="text-center text-[10px] text-[#8a8ab0] mt-0.5 font-mono">SMI v2: {smi_v2}</div>
      </Card>

      {/* PCR */}
      <Card title="Put-Call Ratio">
        <div className="mt-1 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-[#8a8ab0] font-mono text-xs">OI</span>
            <span className={`font-bold font-mono ${pcr_oi > 1.3 ? 'text-[#00d26a]' : pcr_oi < 0.7 ? 'text-[#ff4757]' : 'text-[#ffa502]'}`}>
              {pcr_oi.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8a8ab0] font-mono text-xs">Volume</span>
            <span className="font-mono text-white text-xs">{pcr_vol.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#8a8ab0] font-mono text-xs">Weighted</span>
            <span className="font-mono text-white text-xs">{weighted_pcr.toFixed(2)}</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-center text-[#8a8ab0]">
          {pcr_oi > 1.3 ? '>1.3 Bullish' : pcr_oi < 0.7 ? '<0.7 Bearish' : '0.7–1.3 Neutral'}
        </div>
      </Card>

      {/* Market Bias */}
      <Card title="Market Bias" glow={bias === 'BULLISH' ? '#00d26a' : bias === 'BEARISH' ? '#ff4757' : '#ffa502'}>
        <div className={`text-3xl font-bold text-center mt-2 ${biasColor(bias)}`}>
          {bias === 'BULLISH' ? '▲' : bias === 'BEARISH' ? '▼' : '◆'}
        </div>
        <div className={`text-center font-bold mt-1 ${biasColor(bias)}`}>{bias || '—'}</div>
        <div className="text-center text-[10px] text-[#8a8ab0] mt-1 font-mono">
          Flow: {net_oi_flow > 0 ? '+' : ''}{(net_oi_flow / 1000).toFixed(0)}K
        </div>
      </Card>

      {/* Trap */}
      <Card title="Trap Detector" glow={trap_type ? '#ffa502' : undefined}>
        {trap_type ? (
          <>
            <div className="text-[#ffa502] font-bold text-sm mt-2 text-center">⚠ {trap_type}</div>
            <div className="mt-2">
              <div className="text-[10px] text-[#8a8ab0] mb-1 font-mono">Probability</div>
              <div className="w-full bg-[#2a2a4a] rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#ffa502]"
                  style={{ width: `${trap_probability}%` }}
                />
              </div>
              <div className="text-right text-xs font-mono mt-1 text-[#ffa502]">{trap_probability}%</div>
            </div>
          </>
        ) : (
          <div className="text-[#00d26a] text-sm font-bold text-center mt-4">✓ No Trap</div>
        )}
      </Card>

      {/* Support & Resistance */}
      <Card title="S/R Levels">
        <div className="mt-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#ff4757] font-mono">Resistance</span>
            <span className="font-bold font-mono text-[#ff4757]">{resistance || '—'}</span>
          </div>
          <div className="border-t border-[#2a2a4a]" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#00d26a] font-mono">Support</span>
            <span className="font-bold font-mono text-[#00d26a]">{support || '—'}</span>
          </div>
          <div className="border-t border-[#2a2a4a]" />
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#8a8ab0] font-mono">Max Pain</span>
            <span className="font-mono text-[#ffa502] font-bold">{max_pain || '—'}</span>
          </div>
        </div>
      </Card>

      {/* Confidence */}
      <Card title="Confidence">
        <div className="flex flex-col items-center mt-2">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2a2a4a" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={confidence >= 70 ? '#00d26a' : confidence >= 40 ? '#ffa502' : '#ff4757'}
                strokeWidth="3"
                strokeDasharray={`${confidence} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold font-mono">{confidence}</span>
              <span className="text-[8px] text-[#8a8ab0]">/ 100</span>
            </div>
          </div>
        </div>
      </Card>

    </div>
  )
}
