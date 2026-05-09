import { useState } from 'react'

export function LoginBanner() {
  const [loginUrl, setLoginUrl] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [status, setStatus] = useState('')
  const [step, setStep] = useState(1)

  async function getLoginUrl() {
    const res = await fetch('/api/auth/login-url')
    const data = await res.json()
    setLoginUrl(data.login_url)
    setStep(2)
    window.open(data.login_url, '_blank')
  }

  async function submitAuthCode() {
    if (!authCode.trim()) return
    setStatus('Authenticating…')
    const res = await fetch(`/api/auth/callback?auth_code=${authCode.trim()}`)
    const data = await res.json()
    if (data.authenticated) {
      setStatus('✅ Login successful! Dashboard loading…')
      setTimeout(() => window.location.reload(), 1500)
    } else {
      setStatus('❌ Auth failed. Check the code and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="bg-navy-800 border border-accent/30 rounded-xl p-8 max-w-md w-full space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">NIFTY Smart Money Dashboard</h1>
          <p className="text-gray-400 text-xs mt-1">Daily Fyers login required (tokens expire at midnight)</p>
        </div>

        {step === 1 && (
          <button
            onClick={getLoginUrl}
            className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Step 1 — Open Fyers Login Page
          </button>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-300">
              A browser tab opened with the Fyers login page. Log in, approve permissions, and you'll be
              redirected to <code className="text-accent">http://127.0.0.1?auth_code=XXXX</code>.
              Copy the <code className="text-accent">auth_code</code> value and paste it below.
            </p>
            <input
              type="text"
              placeholder="Paste auth_code here…"
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-accent"
            />
            <button
              onClick={submitAuthCode}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Step 2 — Complete Login
            </button>
          </div>
        )}

        {status && (
          <p className="text-xs text-center" style={{ color: status.includes('✅') ? '#00d26a' : '#ff4757' }}>
            {status}
          </p>
        )}
      </div>
    </div>
  )
}
