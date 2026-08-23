import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcrediLockup, Icon } from '../../shared/ui';
import {
  useBillingPlansQuery,
  useCreateSubscriptionMutation,
  useCurrentSubscriptionQuery,
} from '../../shared/api/billing';
import { resolvePlanCatalog, sortPlansByCatalog } from '../../shared/billing/planCatalog';
import { getDefaultAllowedAppPath, usePermissions } from '../../shared/permissions';
import { AuthSubmitButton } from '../auth/components';
import { PlanOfferDetails } from './components/PlanOfferDetails';
import './plans-page.css';

export function PlansPage() {
  const navigate = useNavigate();
  const { permissionCodes } = usePermissions();
  const plansQuery = useBillingPlansQuery(true);
  const subscriptionQuery = useCurrentSubscriptionQuery(true);
  const createSubscription = useCreateSubscriptionMutation();
  const plans = useMemo(
    () => sortPlansByCatalog((plansQuery.data ?? []).filter((plan) => plan.active)),
    [plansQuery.data]
  );
  const currentPlanId = subscriptionQuery.data?.planId ?? null;
  const currentPlanName = subscriptionQuery.data?.planName ?? 'aucun';
  const homePath = getDefaultAllowedAppPath(permissionCodes) ?? '/app/dashboard';
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  async function handleChoosePlan(planId: string) {
    if (planId === currentPlanId || createSubscription.isPending) {
      return;
    }
    setPendingPlanId(planId);
    try {
      await createSubscription.mutateAsync({ planId });
      await subscriptionQuery.refetch();
      navigate(homePath, { replace: true });
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Impossible de changer de plan.'
      );
    } finally {
      setPendingPlanId(null);
    }
  }

  return (
    <main className="plans-shell">
      <div className="plans-page">
        <header className="plans-header">
          <div className="plans-brand">
            <AcrediLockup size={30} fontSize={22} />
          </div>

          <button
            className="button ghost plans-back"
            type="button"
            onClick={() => navigate(-1)}
          >
            <Icon name="arrowLeft" size={14} />
            Retour
          </button>

          <div className="plans-intro">
            <h1>Choisir un abonnement</h1>
            <p>
              Compare les plans Acredi Space et selectionne celui qui correspond a ton equipe.
              Ton plan actuel est <strong>{currentPlanName}</strong>.
            </p>
          </div>
        </header>

        {plansQuery.error ? <p>{plansQuery.error.message}</p> : null}

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
                const isCurrent = plan.id === currentPlanId;

                return (
                  <article
                    className={`plan-card${isCurrent ? ' current' : ''}${
                      catalog.key === 'pro' ? ' featured' : ''
                    }`}
                    key={plan.id}
                  >
                    <PlanOfferDetails item={catalog} current={isCurrent} />

                    {isCurrent ? (
                      <button className="button ghost button-wide" type="button" disabled>
                        Plan actuel
                      </button>
                    ) : (
                      <AuthSubmitButton
                        type="button"
                        loading={pendingPlanId === plan.id}
                        disabled={Boolean(pendingPlanId) && pendingPlanId !== plan.id}
                        onClick={() => handleChoosePlan(plan.id)}
                      >
                        Choisir {catalog.name}
                      </AuthSubmitButton>
                    )}
                  </article>
                );
              })
            : null}
        </section>
      </div>
    </main>
  );
}
