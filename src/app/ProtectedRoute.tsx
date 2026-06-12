import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getOnboardingRedirectPath, isOnboardingPath } from '../shared/auth/onboarding';
import { useAuth } from '../shared/context';
import { LoadingState } from '../shared/ui';

export function ProtectedRoute() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Vérification de la session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user?.enabled === false) {
    logout();

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: "Compte désactivé. Contactez l'administrateur.",
        }}
      />
    );
  }

  const onboardingRedirectPath = getOnboardingRedirectPath(user?.onboardingStatus);

  if (
    onboardingRedirectPath &&
    !location.pathname.startsWith(onboardingRedirectPath)
  ) {
    return <Navigate to={onboardingRedirectPath} replace />;
  }

  if (!onboardingRedirectPath && isOnboardingPath(location.pathname)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}