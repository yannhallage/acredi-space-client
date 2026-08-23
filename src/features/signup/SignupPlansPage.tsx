import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useBillingPlansQuery } from '../../shared/api/billing';
import { setSignupPlanId, signupOrganizationPath } from '../../shared/auth/signupPlan';
import { resolvePlanCatalog, sortPlansByCatalog } from '../../shared/billing/planCatalog';
import { useAuth } from '../../shared/context';
import { AcrediLockup } from '../../shared/ui';
import {
  AuthFeedbackBanner,
  AuthSubmitButton,
  authFeedback,
  resolveSignupPlansFeedback,
} from '../auth/components';
import { PlanOfferDetails } from '../settings/components/PlanOfferDetails';
import '../settings/plans-page.css';

export function SignupPlansPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const plansQuery = useBillingPlansQuery(isAuthenticated);
  const plans = useMemo(
    () => sortPlansByCatalog((plansQuery.data ?? []).filter((plan) => plan.active)),
    [plansQuery.data]
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPlanId) {
      return;
    }
    const timer = window.setTimeout(() => {
      navigate(signupOrganizationPath);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [selectedPlanId, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  if (user?.onboardingStatus && user.onboardingStatus !== 'ORGANIZATION_SETUP_REQUIRED') {
    if (user.onboardingStatus === 'COMPLETED') {
      return <Navigate to="/signup/success" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  function handleChoosePlan(planId: string) {
    if (selectedPlanId) {
      return;
    }
    setSignupPlanId(planId);
    setSelectedPlanId(planId);
  }

  return (
    <div className="signup-plans-page">
      <div className="signup-plans-inner">
        <header className="signup-plans-header">
          <AcrediLockup size={36} fontSize={24} />
          <div className="signup-org-steps">
            <p className="eyebrow">Etape 3 / 5</p>
            <div className="signup-org-stepper" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((step) => (
                <span key={step} className={step <= 3 ? 'done' : ''} />
              ))}
            </div>
          </div>
        </header>

        <div className="signup-plans-intro">
          <h1>Choisissez votre abonnement</h1>
          <p>
            Selectionnez le plan qui correspond a votre organisation. Vous pourrez le
            modifier plus tard dans les parametres.
          </p>
        </div>

        {plansQuery.error ? (
          <AuthFeedbackBanner feedback={resolveSignupPlansFeedback(plansQuery.error)} />
        ) : null}

        {!plansQuery.loading && !plansQuery.error && plans.length === 0 ? (
          <AuthFeedbackBanner
            feedback={authFeedback(
              'warning',
              'Aucun plan disponible',
              'Aucune offre n’est proposée pour le moment. Réessayez dans un moment, ou contactez le support Acredi.'
            )}
          />
        ) : null}

        <section
          className="plans-grid"
          aria-label="Plans d abonnement"
          aria-busy={plansQuery.loading}
        >
          {plansQuery.loading
            ? ['plan-skeleton-1', 'plan-skeleton-2', 'plan-skeleton-3'].map((item) => (
                <article className="plan-card plan-card-skeleton" key={item}>
                  <div className="plan-card-top">
                    <div className="plan-card-labels">
                      <span className="skeleton-line plan-skeleton-tag" />
                    </div>
                    <span className="skeleton-line plan-skeleton-title" />
                    <div className="skeleton-copy">
                      <span className="skeleton-line" />
                      <span className="skeleton-line skeleton-short" />
                    </div>
                  </div>

                  <div className="plan-price">
                    <span className="skeleton-line plan-skeleton-price" />
                    <span className="skeleton-line plan-skeleton-interval" />
                  </div>

                  <ul className="plan-features">
                    {Array.from({ length: 8 }, (_, index) => (
                      <li key={`${item}-feature-${index}`}>
                        <span className="skeleton-line plan-skeleton-check" />
                        <span className="skeleton-line plan-skeleton-feature" />
                      </li>
                    ))}
                  </ul>

                  <span className="skeleton-line plan-skeleton-button" />
                </article>
              ))
            : null}

          {!plansQuery.loading
            ? plans.map((plan, index) => {
                const catalog = resolvePlanCatalog(plan, index);

                return (
                  <article
                    className={`plan-card${catalog.key === 'pro' ? ' featured' : ''}`}
                    key={plan.id}
                  >
                    <PlanOfferDetails item={catalog} />

                    <AuthSubmitButton
                      type="button"
                      loading={selectedPlanId === plan.id}
                      disabled={Boolean(selectedPlanId) && selectedPlanId !== plan.id}
                      onClick={() => handleChoosePlan(plan.id)}
                    >
                      Continuer avec {catalog.name}
                    </AuthSubmitButton>
                  </article>
                );
              })
            : null}
        </section>
      </div>
    </div>
  );
}
