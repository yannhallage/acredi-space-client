import { Outlet } from 'react-router-dom';
import { AuthHero } from '../features/auth/components';

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <AuthHero />
      <section className="auth-panel">
        <Outlet />
      </section>
    </main>
  );
}
