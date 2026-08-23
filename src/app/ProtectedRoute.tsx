import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  getCompletedOnboardingExitPath,
  getOnboardingRedirectPath,
  isAllowedOnboardingPath,
  isOnboardingPath,
} from '../shared/auth/onboarding';
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

  const onboardingHomePath = getOnboardingRedirectPath(user?.onboardingStatus);

  if (onboardingHomePath) {
    if (!isAllowedOnboardingPath(user?.onboardingStatus, location.pathname)) {
      return <Navigate to={onboardingHomePath} replace />;
    }

    return <Outlet />;
  }

  // Onboarding terminé : ne pas rester sur une URL d'onboarding (sauf /signup/success).
  if (isOnboardingPath(location.pathname)) {
    return <Navigate to={getCompletedOnboardingExitPath(location.pathname)} replace />;
  }

  return <Outlet />;
}