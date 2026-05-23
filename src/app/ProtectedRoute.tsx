import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/context';
import { LoadingState } from '../shared/ui';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState label="Verification de la session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
