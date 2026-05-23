import { useParams } from 'react-router-dom'
import { ModulePlaceholder } from '../../../shared/components/ModulePlaceholder'

export function AdminUsersPage({ detail = false }: { detail?: boolean }) {
  const { userId } = useParams()

  if (detail) {
    return <ModulePlaceholder title="Utilisateur" description={`Profil, roles et equipes de l'utilisateur ${userId ?? ''}.`} />
  }

  return <ModulePlaceholder title="Utilisateurs" description="Creation, modification, roles et desactivation des comptes." />
}
