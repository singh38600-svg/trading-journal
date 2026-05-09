import React, { useState, useEffect, useRef } from 'react'
import SignalCards from './components/SignalCards'
import OptionChainHeatmap from './components/OptionChainHeatmap'
import FuturesPanel from './components/FuturesPanel'
import SignalsPanel from './components/SignalsPanel'
import HistoricalLog from './components/HistoricalLog'

const API = import.meta.env.VITE_API_URL || '/api'
const WS_URL = import.meta.env.VITE_WS_URL || (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/api/ws'

function useWebSocket(url, onMessage) {
  const ws = useRef(null)
  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url)
      ws.current.onmessage = e => {
        try { onMessage(JSON.parse(e.data)) } catch {}
      }
      ws.current.onclose = () => setTimeout(connect, 3000)
    }
    connect()
    return () => ws.current?.close()
  }, [url])
}

export default function App() {
  const [signals, setSignals] = useState(null)
  const [connected, setConnected] = useState(false)
  const [authCode, setAuthCode] = useState('')
  const [authStep, setAuthStep] = useState('idle') // idle | waiting | done
  const [lastUpdate, setLastUpdate] = useState('')
  const [authUrl, setAuthUrl] = useState('')

  useWebSocket(WS_URL, data => {
    setSignals(data)
    setLastUpdate(new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }))
    setConnected(true)
  })

  async function startAuth() {
    const res = await fetch(`${API}/auth/url`)
    const data = await res.json()
    setAuthUrl(data.url)
    window.open(data.url, '_blank')
    setAuthStep('waiting')
  }

  async function submitAuthCode() {
    if (!authCode.trim()) return
    try {
      const res = await fetch(`${API}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_code: authCode.trim() }),
      })
      if (res.ok) {
        setAuthStep('done')
        fetch(`${API}/refresh`, { method: 'POST' })
      }
    } catch (e) {
      alert('Auth failed: ' + e.message)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a1a', color: '#e0e0e0' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 sticky top-0 z-10"
        style={{ background: '#0d0d20' }}>
        <div>
          <h1 className="text-base font-bold tracking-widest accent">NIFTY SMART MONEY</h1>
          <div className="text-xs text-gray-500">Institutional Option Chain Intelligence</div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <div className="text-xs text-gray-500">Updated: {lastUpdate}</div>}
          <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${connected ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 blink' : 'bg-gray-500'}`} />
            {connected ? 'LIVE' : 'OFFLINE'}
          </div>
          {signals?.spot && (
            <div className="text-sm font-bold text-white">{signals.spot.toLocaleString()}</div>
          )}
          {authStep !== 'done' && (
            <button onClick={authStep === 'idle' ? startAuth : undefined}
              className="text-xs px-3 py-1 rounded bg-accent text-white font-bold hover:opacity-80">
              {authStep === 'idle' ? 'Connect Fyers' : 'Connecting...'}
            </button>
          )}
        </div>
      </div>

      {/* Auth flow */}
      {authStep === 'waiting' && (
        <div className="mx-4 mt-4 p-4 card border-accent">
          <div className="text-sm font-bold mb-2 accent">Step 2 — Paste Auth Code</div>
          <div className="text-xs text-gray-400 mb-3">
            Fyers opened in a new tab. Log in → you'll see a blank page.
            Copy everything after <code className="text-yellow-400">auth_code=</code> in the URL and paste below.
          </div>
          <div className="flex gap-2">
            <input value={authCode} onChange={e => setAuthCode(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1 text-sm text-white"
              placeholder="Paste auth_code here..." />
            <button onClick={submitAuthCode}
              className="px-4 py-1 bg-accent text-white rounded text-sm font-bold hover:opacity-80">
              Connect
            </button>
          </div>
          {authUrl && (
            <div className="mt-2 text-xs text-gray-500">
              If new tab didn't open: <a href={authUrl} target="_blank" className="accent underline">click here</a>
            </div>
          )}
        </div>
      )}

      {/* Main dashboard */}
      <div className="p-4 max-w-7xl mx-auto">
        <SignalCards signals={signals} />

        <OptionChainHeatmap signals={signals} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <FuturesPanel signals={signals} />
          <SignalsPanel signals={signals} />
        </div>

        <HistoricalLog />
      </div>

      <div className="text-center text-xs text-gray-700 py-4">
        NIFTY Intelligence System • Not financial advice • For educational use
      </div>
    </div>
  )
}
