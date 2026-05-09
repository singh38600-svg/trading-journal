export function SMIGauge({ smi, label }) {
  // Map 0-100 to colour
  const color =
    smi >= 70 ? '#00d26a' :
    smi >= 55 ? '#7bed9f' :
    smi >= 45 ? '#ffa502' :
    smi >= 30 ? '#ff6b81' : '#ff4757'

  const radius = 54
  const circumference = Math.PI * radius   // half-circle
  const offset = circumference * (1 - smi / 100)

  return (
    <div className="bg-navy-800 border border-white/5 rounded-lg p-4 flex flex-col items-center gap-2">
      <span className="text-xs text-gray-400 uppercase tracking-widest">Smart Money Index</span>
      <svg width="140" height="80" viewBox="0 0 140 80">
        {/* Background arc */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none" stroke="#1e1e3a" strokeWidth="12" strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.8s ease' }}
        />
        <text x="70" y="68" textAnchor="middle" fill={color} fontSize="26" fontWeight="bold" fontFamily="monospace">
          {smi}
        </text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}
