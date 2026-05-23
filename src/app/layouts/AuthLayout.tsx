import { Outlet } from 'react-router-dom'
import { LogoMark } from '../../shared/components/LogoMark'

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <LogoMark />
        <div>
          <h1>Acredi Space</h1>
          <p>Connexion a la plateforme interne.</p>
        </div>
        <Outlet />
      </section>
    </main>
  )
}
