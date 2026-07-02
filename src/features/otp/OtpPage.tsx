import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { resolveAuthenticatedRedirect } from "../../shared/auth/onboarding";
import { useAuth } from "../../shared/context";
import { OtpForm } from "./components";

export function OtpPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    "/app/dashboard";

  if (isAuthenticated) {
    return <Navigate to={resolveAuthenticatedRedirect(user, redirectTo)} replace />;
  }

  return (
    <main className="theme-root auth-layout">
      <section className="auth-panel">
        <OtpForm
          redirectTo={redirectTo}
          authLoading={loading}
          onVerified={(path) => navigate(path, { replace: true })}
        />
      </section>
    </main>
  );
}
