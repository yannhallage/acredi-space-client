import { env } from '../../app/config/env'

export interface JitsiRoomConfig {
  roomName: string
  jwt?: string
  displayName: string
  parentNode: HTMLElement
}

export function buildJitsiUrl(roomName: string, jwt?: string) {
  const url = new URL(`https://${env.jitsiDomain}/${roomName}`)
  if (jwt) url.searchParams.set('jwt', jwt)
  return url.toString()
}

export function createJitsiIframe(config: JitsiRoomConfig) {
  const iframe = document.createElement('iframe')
  iframe.src = buildJitsiUrl(config.roomName, config.jwt)
  iframe.allow = 'camera; microphone; display-capture; fullscreen'
  iframe.title = `Reunion ${config.roomName}`
  iframe.className = 'jitsi-frame'
  config.parentNode.appendChild(iframe)
  return iframe
}
