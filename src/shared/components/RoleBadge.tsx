import { Badge } from '@rtcamp/frappe-ui-react'
import type { Role } from '../../entities/user/user.types'

const labels: Record<Role, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  COLLABORATOR: 'Collaborateur',
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge label={labels[role]} theme={role === 'ADMIN' ? 'red' : role === 'MANAGER' ? 'blue' : 'gray'} size="sm" />
}
