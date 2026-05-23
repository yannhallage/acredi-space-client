import { Button } from '@rtcamp/frappe-ui-react'
import { useAuthStore } from '../auth.store'

export function SessionExpiredDialog() {
  const open = useAuthStore((state) => state.sessionExpiredOpen)
  const close = useAuthStore((state) => state.closeSessionExpired)

  if (!open) return null

  return (
    <div className="dialog-backdrop">
      <section className="dialog-panel">
        <h2>Session expiree</h2>
        <p>Reconnectez-vous pour continuer a utiliser Acredi Space.</p>
        <Button label="Fermer" theme="gray" variant="solid" onClick={close} />
      </section>
    </div>
  )
}
