function Signal({ label, value, active, color = 'text-green-400' }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className={`text-xs font-bold ${active ? color : 'text-gray-600'}`}>
        {active ? value : '—'}
      </span>
    </div>
  )
}

export function SignalsPanel({ data }) {
  if (!data) return null
  return (
    <div className="bg-navy-800 border border-white/5 rounded-lg p-4">
      <h3 className="text-xs text-gray-400 uppercase tracking-widest mb-3">Signals Panel</h3>
      <div className="space-y-0">
        <Signal label="Breakout" value="✅ CONFIRMED" active={data.breakout_confirmed} color="text-green-400" />
        <Signal label="Reversal" value="✅ DETECTED" active={data.reversal_signal} color="text-yellow-400" />
        <Signal label="Trap" value={`⚠️ ${data.trap_type?.replace('_', ' ')}`}
          active={data.trap_type !== 'NONE'} color="text-red-400" />
        <Signal label="Trap Prob" value={`${data.trap_probability}%`}
          active={data.trap_probability > 0} color="text-orange-400" />
        <Signal label="OI Spikes" value={`⚡ ${data.oi_spike_strikes?.length} strikes`}
          active={data.oi_spike_strikes?.length > 0} color="text-yellow-400" />
        <Signal label="IV Spikes" value={`📈 ${data.iv_spike_strikes?.length} strikes`}
          active={data.iv_spike_strikes?.length > 0} color="text-purple-400" />
        <Signal label="Agg Writing" value={`🏦 ${data.aggressive_writing_strikes?.length} strikes`}
          active={data.aggressive_writing_strikes?.length > 0} color="text-red-300" />
        <Signal label="Net OI Flow" value={`${data.net_oi_flow_label} (${(data.net_oi_flow / 1000).toFixed(0)}K)`}
          active={!!data.net_oi_flow_label}
          color={data.net_oi_flow_label === 'BULLISH' ? 'text-green-400' : data.net_oi_flow_label === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'} />
        <Signal label="Max Gamma" value={`${data.max_gamma_strike}`} active={!!data.max_gamma_strike} color="text-accent" />
      </div>
    </div>
  )
}
