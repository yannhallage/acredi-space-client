import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useBillingAccessQuery } from '../shared/api/billing';
import { LoadingState } from '../shared/ui';

export const BILLING_PLANS_PATH = '/settings/plans';

export function BillingGuard() {
  const location = useLocation();
  const accessQuery = useBillingAccessQuery(true);

  if (accessQuery.loading) {
    return <LoadingState label="Vérification de l'abonnement..." />;
  }

  if (accessQuery.error || !accessQuery.data?.allowed) {
    return <Navigate to={BILLING_PLANS_PATH} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
