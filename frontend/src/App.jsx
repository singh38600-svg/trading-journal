import { useState } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import Header          from './components/Header'
import SignalCards     from './components/SignalCards'
import OptionChainHeatmap from './components/OptionChainHeatmap'
import FuturesPanel    from './components/FuturesPanel'
import SignalsPanel    from './components/SignalsPanel'
import HistoricalLog   from './components/HistoricalLog'

export default function App() {
  const { data, connected, lastUpdate } = useWebSocket()
  const [tab, setTab] = useState('chain')   // 'chain' | 'history'

  const signals      = data?.signals      || {}
  const strikes      = data?.strikes      || []
  const futures      = data?.futures      || {}
  const futuresSig   = data?.futures_signals || {}
  const session      = data?.session      || {}
  const spot         = data?.spot         || 0
  const expiry       = data?.expiry       || ''

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-[#e0e0e0]">
      <Header
        connected={connected}
        lastUpdate={lastUpdate}
        spot={spot}
        expiry={expiry}
      />

      {/* Signal cards row */}
      <SignalCards signals={signals} futuresSig={futuresSig} />

      {/* Tab switcher */}
      <div className="flex gap-2 px-6 mb-4">
        {[['chain', 'Option Chain'], ['history', 'Historical Log']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`text-xs px-4 py-2 rounded-lg font-mono border transition-colors ${
              tab === key
                ? 'bg-[#3742fa] border-[#3742fa] text-white'
                : 'border-[#2a2a4a] text-[#8a8ab0] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'chain' && (
        <>
          {/* Option chain heatmap */}
          <OptionChainHeatmap strikes={strikes} signals={signals} spot={spot} />

          {/* Bottom row: Futures + Signals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 mb-6">
            <FuturesPanel futures={futures} futuresSig={futuresSig} />
            <SignalsPanel signals={signals} session={session} futuresSig={futuresSig} />
          </div>
        </>
      )}

      {tab === 'history' && <HistoricalLog />}

      {/* No data notice */}
      {!data && (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="text-5xl mb-4">◈</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Fyers to begin</h2>
          <p className="text-[#8a8ab0] max-w-md text-sm leading-relaxed">
            Click <strong className="text-white">Connect Fyers</strong> in the top-right, log in via Fyers,
            paste the <code className="text-[#ffa502]">auth_code</code> from the redirect URL, and the
            dashboard will populate automatically.
          </p>
          <p className="text-[#8a8ab0] text-xs mt-4">
            This is required once per trading day — Fyers tokens expire at midnight.
          </p>
        </div>
      )}
    </div>
  )
}
