import { Outlet } from 'react-router-dom'
import { AppSidebar } from '../../shared/components/AppSidebar'
import { TopBar } from '../../shared/components/TopBar'

export function WorkspaceLayout() {
  return (
    <div className="workspace-shell">
      <AppSidebar />
      <main className="workspace-main">
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}
