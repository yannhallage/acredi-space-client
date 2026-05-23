import { Client } from '@stomp/stompjs'
import { env } from '../../app/config/env'

export function createSocketClient(token?: string) {
  return new Client({
    brokerURL: env.realtimeUrl,
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
    reconnectDelay: 5_000,
  })
}
