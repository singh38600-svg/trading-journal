import { useEffect, useRef, useState, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'

export function useWebSocket() {
  const [data, setData]         = useState(null)
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const wsRef    = useRef(null)
  const retryRef = useRef(null)
  const retries  = useRef(0)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      retries.current = 0
      console.log('WS connected')
    }

    ws.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        if (parsed.type === 'ping') return   // keep-alive, ignore
        setData(parsed)
        setLastUpdate(new Date())
      } catch (_) {}
    }

    ws.onclose = () => {
      setConnected(false)
      // Exponential backoff: 2s, 4s, 8s, max 30s
      const delay = Math.min(2000 * Math.pow(2, retries.current), 30000)
      retries.current += 1
      retryRef.current = setTimeout(connect, delay)
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { data, connected, lastUpdate }
}
