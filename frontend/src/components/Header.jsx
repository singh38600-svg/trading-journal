import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export default function Header({ connected, lastUpdate, spot, expiry }) {
  const [authCode, setAuthCode]   = useState('')
  const [showAuth, setShowAuth]   = useState(false)
  const [authMsg, setAuthMsg]     = useState('')
  const [loading, setLoading]     = useState(false)

  const openFyersLogin = async () => {
    const res = await fetch(`${API}/auth/url`)
    const json = await res.json()
    window.open(json.auth_url, '_blank')
    setShowAuth(true)
  }

  const submitToken = async () => {
    if (!authCode.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/token?auth_code=${encodeURIComponent(authCode.trim())}`, { method: 'POST' })
      const json = await res.json()
      setAuthMsg(json.success ? '✅ Connected! Data loading...' : '❌ ' + (json.detail || 'Failed'))
      if (json.success) setTimeout(() => setShowAuth(false), 2000)
    } catch (e) {
      setAuthMsg('❌ Network error')
    }
    setLoading(false)
  }

  const now = lastUpdate ? lastUpdate.toLocaleTimeString('en-IN', { hour12: false }) : '--:--:--'

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2a4a] bg-[#0a0a1a]/95 backdrop-blur px-6 py-3 flex items-center justify-between">
      {/* Left: brand */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-xs text-[#8a8ab0] tracking-widest uppercase font-mono">◈ Institutional Intelligence</div>
          <div className="text-lg font-bold tracking-tight text-white leading-none">NIFTY Smart Money</div>
        </div>
        {spot > 0 && (
          <div className="hidden md:flex flex-col ml-6 pl-6 border-l border-[#2a2a4a]">
            <span className="text-xs text-[#8a8ab0] font-mono">SPOT</span>
            <span className="text-xl font-bold font-mono text-white">₹{spot.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {expiry && (
          <div className="hidden md:flex flex-col pl-6 border-l border-[#2a2a4a]">
            <span className="text-xs text-[#8a8ab0] font-mono">EXPIRY</span>
            <span className="text-sm font-mono text-[#e0e0e0]">{expiry}</span>
          </div>
        )}
      </div>

      {/* Right: status + auth */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className={`w-2 h-2 rounded-full live-dot ${connected ? 'bg-[#00d26a]' : 'bg-[#ff4757]'}`} />
          <span className={connected ? 'text-[#00d26a]' : 'text-[#ff4757]'}>
            {connected ? 'Live' : 'Reconnecting'}
          </span>
          <span className="text-[#8a8ab0] text-xs ml-2">{now}</span>
        </div>

        <button
          onClick={openFyersLogin}
          className="text-xs px-3 py-1.5 rounded bg-[#3742fa] hover:bg-[#4a55ff] text-white font-semibold transition-colors"
        >
          {connected ? 'Re-auth Fyers' : 'Connect Fyers'}
        </button>
      </div>

      {/* Auth modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl p-8 w-full max-w-md">
            <h2 className="text-lg font-bold mb-1">Daily Fyers Auth</h2>
            <p className="text-[#8a8ab0] text-sm mb-4">
              After logging in via Fyers, copy the <code className="text-[#ffa502]">auth_code</code> value from the redirect URL and paste below.
            </p>
            <input
              className="w-full bg-[#0a0a1a] border border-[#2a2a4a] rounded-lg px-4 py-2 text-sm font-mono text-white mb-3 focus:outline-none focus:border-[#3742fa]"
              placeholder="Paste auth_code here..."
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitToken()}
            />
            {authMsg && <p className="text-sm mb-3">{authMsg}</p>}
            <div className="flex gap-3">
              <button
                onClick={submitToken}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-[#3742fa] hover:bg-[#4a55ff] text-white font-semibold text-sm disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
              <button
                onClick={() => setShowAuth(false)}
                className="px-4 py-2 rounded-lg border border-[#2a2a4a] text-[#8a8ab0] hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
