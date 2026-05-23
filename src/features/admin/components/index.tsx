import { ScaffoldPanel } from '../../../shared/components/ScaffoldPanel'

export function UserTable() {
  return <ScaffoldPanel name="UserTable" description="Liste, recherche et actions utilisateurs." />
}

export function UserFormDialog() {
  return <ScaffoldPanel name="UserFormDialog" description="Creation et modification compte utilisateur." />
}

export function TeamTable() {
  return <ScaffoldPanel name="TeamTable" description="Liste des equipes et managers." />
}

export function TeamMembersManager() {
  return <ScaffoldPanel name="TeamMembersManager" description="Ajout, retrait et role des membres." />
}

export function AuditLogTable() {
  return <ScaffoldPanel name="AuditLogTable" description="Consultation des actions sensibles." />
}

export function PlatformSettingsForm() {
  return <ScaffoldPanel name="PlatformSettingsForm" description="Parametres globaux de la plateforme." />
}

export function StorageUsageWidget() {
  return <ScaffoldPanel name="StorageUsageWidget" description="Suivi stockage MinIO et quotas." />
}
