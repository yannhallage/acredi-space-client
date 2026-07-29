import { Navigate, useLocation } from 'react-router-dom';
import { resolveAuthenticatedRedirect } from '../../shared/auth/onboarding';
import { useAuth } from '../../shared/context';
import { LoginForm } from './components';

export function LoginPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/app/dashboard';

  if (isAuthenticated) {
    return <Navigate to={resolveAuthenticatedRedirect(user, redirectTo)} replace />;
  }

  return <LoginForm redirectTo={redirectTo} authLoading={loading} />;
}
