import { useNavigate } from 'react-router-dom';
import { AcrediLockup, Icon } from '../../shared/ui';
import {
  formatBillingInterval,
  planPriceLabel,
  useBillingPlansQuery,
  useCreateSubscriptionMutation,
  useCurrentSubscriptionQuery,
} from '../../shared/api/billing';
import './plans-page.css';

export function PlansPage() {
  const navigate = useNavigate();
  const plansQuery = useBillingPlansQuery(true);
  const subscriptionQuery = useCurrentSubscriptionQuery(true);
  const createSubscription = useCreateSubscriptionMutation();
  const plans = (plansQuery.data ?? []).filter((plan) => plan.active);
  const currentPlanId = subscriptionQuery.data?.planId ?? null;
  const currentPlanName = subscriptionQuery.data?.planName ?? 'aucun';

  async function handleChoosePlan(planId: string) {
    if (planId === currentPlanId || createSubscription.isPending) {
      return;
    }
    try {
      await createSubscription.mutateAsync({ planId });
      await subscriptionQuery.refetch();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : 'Impossible de changer de plan.'
      );
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

        {plansQuery.loading ? <p>Chargement des plans...</p> : null}
        {plansQuery.error ? <p>{plansQuery.error.message}</p> : null}

        <section className="plans-grid" aria-label="Plans d abonnement">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            const description =
              plan.description?.trim() ||
              'Offre Acredi Space pour ton organisation.';

            return (
              <article
                className={`plan-card${isCurrent ? ' current' : ''}`}
                key={plan.id}
              >
                <div className="plan-card-top">
                  <div className="plan-card-labels">
                    {isCurrent ? <span className="plan-tag current">Plan actuel</span> : null}
                  </div>
                  <h2>{plan.name}</h2>
                  <p>{description}</p>
                </div>

                <div className="plan-price">
                  <strong>{planPriceLabel(plan)}</strong>
                  <span>{formatBillingInterval(plan.billingInterval)}</span>
                </div>

                <ul className="plan-features">
                  <li>
                    <Icon name="check" size={14} />
                    <span>Acces collab files, notes, calendrier</span>
                  </li>
                  <li>
                    <Icon name="check" size={14} />
                    <span>Equipes et discussions</span>
                  </li>
                  <li>
                    <Icon name="check" size={14} />
                    <span>Facturation organisation</span>
                  </li>
                </ul>

                <button
                  className={`button ${isCurrent ? 'ghost' : 'primary'} button-wide`}
                  type="button"
                  disabled={isCurrent || createSubscription.isPending}
                  onClick={() => handleChoosePlan(plan.id)}
                >
                  {isCurrent ? 'Plan actuel' : `Choisir ${plan.name}`}
                </button>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
