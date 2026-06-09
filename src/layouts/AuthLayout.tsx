import { Outlet } from 'react-router-dom';
import { AcrediLockup } from '../shared/ui';

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-art">
        <AcrediLockup size={34} fontSize={24} />
        <div className="auth-cubes" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="auth-copy">
          <p>Workspace securise pour fichiers, discussions, reunions et pilotage equipe.</p>
        </div>
      </section>
      <section className="auth-panel">
        <Outlet />
      </section>
    </main>
  );
}
