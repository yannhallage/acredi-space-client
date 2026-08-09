import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <img
        className="auth-corner auth-corner-left"
        src="/auth/corner-left.png"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <img
        className="auth-corner auth-corner-right"
        src="/auth/corner-right.png"
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <section className="auth-panel">
        <Outlet />
      </section>
    </main>
  );
}
