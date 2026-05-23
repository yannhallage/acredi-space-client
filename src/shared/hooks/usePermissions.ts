import { canAccessAdmin, canCreateSharedFolder, canManageTeam } from '../../app/config/permissions'
import { useAuth } from '../../app/providers/AuthProvider'

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role

  return {
    canAccessAdmin: role ? canAccessAdmin(role) : false,
    canManageTeam: role ? canManageTeam(role) : false,
    canCreateSharedFolder: role ? canCreateSharedFolder(role) : false,
  }
}
