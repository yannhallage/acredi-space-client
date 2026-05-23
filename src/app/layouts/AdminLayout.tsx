import { WorkspaceLayout } from './WorkspaceLayout'
import { RoleGuard } from '../router/routeGuards'

export function AdminLayout() {
  return (
    <RoleGuard roles={['ADMIN']}>
      <WorkspaceLayout />
    </RoleGuard>
  )
}
