import { ScaffoldPanel } from '../../../shared/components/ScaffoldPanel'

export function PresenceIndicator() {
  return <ScaffoldPanel name="PresenceIndicator" description="Disponible, occupe, absent, hors ligne ou en reunion." />
}

export function StatusMenu() {
  return <ScaffoldPanel name="StatusMenu" description="Statut personnalise et statut automatique." />
}

export function NotificationCenter() {
  return <ScaffoldPanel name="NotificationCenter" description="Notifications fichiers, messages, reunions et mentions." />
}

export function ToastStack() {
  return <ScaffoldPanel name="ToastStack" description="Feedback immediat des actions utilisateur." />
}
