/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { RealtimeEvent } from '../../services/realtime/realtimeEvents'

interface RealtimeContextValue {
  connected: boolean
  connect: () => void
  disconnect: () => void
  publishLocalEvent: (event: RealtimeEvent) => void
  lastEvent: RealtimeEvent | null
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

export function RealtimeProvider({ children }: PropsWithChildren) {
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)

  const connect = useCallback(() => {
    setConnected(true)
  }, [])

  const disconnect = useCallback(() => {
    setConnected(false)
  }, [])

  const publishLocalEvent = useCallback((event: RealtimeEvent) => {
    setLastEvent(event)
  }, [])

  const value = useMemo(
    () => ({
      connected,
      connect,
      disconnect,
      lastEvent,
      publishLocalEvent,
    }),
    [connect, connected, disconnect, lastEvent, publishLocalEvent],
  )

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtime() {
  const context = useContext(RealtimeContext)

  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider')
  }

  return context
}
