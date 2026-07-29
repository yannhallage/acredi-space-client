import { useNavigate } from 'react-router-dom';
import { AcrediLockup, Icon } from '../../shared/ui';
import { BILLING_PLANS, CURRENT_SUBSCRIPTION } from './billing/data';
import './plans-page.css';

export function PlansPage() {
  const navigate = useNavigate();

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
              Ton plan actuel est <strong>{CURRENT_SUBSCRIPTION.planName}</strong>.
            </p>
          </div>
        </header>

        <section className="plans-grid" aria-label="Plans d abonnement">
          {BILLING_PLANS.map((plan) => {
            const isCurrent = plan.id === CURRENT_SUBSCRIPTION.planId;

            return (
              <article
                className={`plan-card${plan.featured ? ' featured' : ''}${isCurrent ? ' current' : ''}`}
                key={plan.id}
              >
                <div className="plan-card-top">
                  <div className="plan-card-labels">
                    {plan.featured ? <span className="plan-tag">Recommande</span> : null}
                    {isCurrent ? <span className="plan-tag current">Plan actuel</span> : null}
                  </div>
                  <h2>{plan.name}</h2>
                  <p>{plan.description}</p>
                </div>

                <div className="plan-price">
                  <strong>{plan.priceLabel}</strong>
                  <span>{plan.periodLabel}</span>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Icon name="check" size={14} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`button ${isCurrent ? 'ghost' : 'primary'} button-wide`}
                  type="button"
                  disabled={isCurrent}
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
