export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Acredi Space',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  realtimeUrl: import.meta.env.VITE_REALTIME_URL ?? '/ws',
  jitsiDomain: import.meta.env.VITE_JITSI_DOMAIN ?? 'meet.jit.si',
  production: import.meta.env.PROD,
}
