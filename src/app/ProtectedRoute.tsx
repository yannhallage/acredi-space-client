import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/context';
import { LoadingState } from '../shared/ui';

export function ProtectedRoute() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Verification de la session..." />;
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
        state={{ from: location, message: 'Compte desactive. Contactez l administrateur.' }}
      />
    );
  }

  const onboardingStatus = user?.onboardingStatus?.toUpperCase();

  if (
    onboardingStatus === 'PASSWORD_REQUIRED_CHANGE' &&
    !location.pathname.startsWith('/onboarding/password-change')
  ) {
    return <Navigate to="/onboarding/password-change" replace />;
  }

  if (
    onboardingStatus === 'PROFILE_COMPLETION_REQUIRED' &&
    !location.pathname.startsWith('/onboarding/profile-completion')
  ) {
    return <Navigate to="/onboarding/profile-completion" replace />;
  }

  return <Outlet />;

  
}
