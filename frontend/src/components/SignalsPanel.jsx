// Active signals panel — breakout, reversal, OI spikes, aggressive writing, session behavior

function SignalRow({ emoji, label, value, valueClass = 'text-white', sub }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-[#2a2a4a] last:border-0">
      <div>
        <div className="text-[10px] text-[#8a8ab0] font-mono uppercase tracking-wider">
          {emoji} {label}
        </div>
        {sub && <div className="text-[9px] text-[#8a8ab0] mt-0.5">{sub}</div>}
      </div>
      <span className={`font-mono text-xs font-bold ${valueClass} ml-3 text-right`}>{value}</span>
    </div>
  )
}

export default function SignalsPanel({ signals = {}, session = {}, futuresSig = {} }) {
  const {
    breakout_signal, reversal_signal, oi_spikes = [], aggressive_writing = [],
    resistance_zone = [], support_zone = [], net_oi_flow = 0,
  } = signals

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-4">
      <div className="text-[10px] text-[#8a8ab0] tracking-widest uppercase font-mono mb-3">Live Signals</div>

      <SignalRow
        emoji="🚀" label="Breakout"
        value={breakout_signal ? 'ACTIVE' : 'None'}
        valueClass={breakout_signal ? 'text-[#00d26a]' : 'text-[#8a8ab0]'}
      />
      <SignalRow
        emoji="🔄" label="Reversal"
        value={reversal_signal ? 'ACTIVE' : 'None'}
        valueClass={reversal_signal ? 'text-[#ffa502]' : 'text-[#8a8ab0]'}
      />
      <SignalRow
        emoji="📊" label="Net OI Flow"
        value={(net_oi_flow > 0 ? '+' : '') + (net_oi_flow / 1000).toFixed(0) + 'K'}
        valueClass={net_oi_flow > 0 ? 'text-[#00d26a]' : net_oi_flow < 0 ? 'text-[#ff4757]' : 'text-[#8a8ab0]'}
      />

      {/* OI Spikes */}
      {oi_spikes.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] text-[#ffa502] font-mono uppercase tracking-wider mb-1.5">⚡ OI Spikes (Scalping)</div>
          {oi_spikes.slice(0, 4).map((sp, i) => (
            <div key={i} className="flex justify-between items-center text-[10px] py-1 border-b border-[#2a2a4a] last:border-0">
              <span className="font-mono text-white">{sp.strike}</span>
              <span className={`font-mono ${sp.oich > 0 ? 'text-[#ff4757]' : 'text-[#7bed9f]'}`}>
                {sp.oich > 0 ? '↑' : '↓'} {Math.abs(sp.oich / 1000).toFixed(0)}K
              </span>
              <span className="text-[#8a8ab0]">{sp.buildup}</span>
            </div>
          ))}
        </div>
      )}

      {/* Aggressive Writing */}
      {aggressive_writing.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] text-[#3742fa] font-mono uppercase tracking-wider mb-1.5">🏦 Aggressive Writing</div>
          {aggressive_writing.slice(0, 3).map((w, i) => (
            <div key={i} className="text-[10px] py-1 border-b border-[#2a2a4a] last:border-0">
              <span className="font-mono text-white">{w.strike}</span>
              <span className="text-[#8a8ab0] ml-2">{w.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* S/R Zones */}
      {resistance_zone.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] text-[#ff4757] font-mono uppercase tracking-wider mb-1">Resistance Zone</div>
          <div className="font-mono text-xs text-[#ff6b81]">{resistance_zone.join(' · ')}</div>
        </div>
      )}
      {support_zone.length > 0 && (
        <div className="mt-2">
          <div className="text-[10px] text-[#00d26a] font-mono uppercase tracking-wider mb-1">Support Zone</div>
          <div className="font-mono text-xs text-[#7bed9f]">{support_zone.join(' · ')}</div>
        </div>
      )}

      {/* Session behavior */}
      {session.phase && (
        <div className="mt-3 p-2 rounded-lg bg-[#0a0a1a] border border-[#2a2a4a]">
          <div className="text-[9px] text-[#8a8ab0] font-mono uppercase">{session.phase}</div>
          <div className="text-[11px] text-[#e0e0e0] mt-0.5">{session.observation}</div>
        </div>
      )}
    </div>
  )
}
