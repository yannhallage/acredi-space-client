import { useNavigate } from 'react-router-dom';
import {
  formatBillingCycle,
  normalizeSubscriptionStatus,
  useCurrentSubscriptionQuery,
} from '../../../../shared/api/billing';
import { formatBillingDate, formatSubscriptionStatus } from '../../utils';

type SubscriptionSectionProps = {
  onClose: () => void;
};

export function SubscriptionSection({ onClose }: SubscriptionSectionProps) {
  const navigate = useNavigate();
  const subscriptionQuery = useCurrentSubscriptionQuery(true);
  const subscription = subscriptionQuery.data;

  if (subscriptionQuery.loading) {
    return (
      <section
        className="modal-setting-section modal-setting-billing"
        aria-busy="true"
        aria-label="Chargement de l'abonnement"
      >
        <div className="modal-setting-section-heading">
          <div>
            <h4>Abonnement actuel</h4>
            <p>Resume de ton plan Acredi Space en cours.</p>
          </div>
        </div>

        <article className="modal-setting-subscription-card modal-setting-subscription-skeleton">
          <div className="modal-setting-subscription-top">
            <div className="skeleton-copy">
              <span className="skeleton-line modal-setting-subscription-skeleton-eyebrow" />
              <span className="skeleton-line modal-setting-subscription-skeleton-title" />
              <span className="skeleton-line modal-setting-subscription-skeleton-cycle" />
            </div>
            <span className="skeleton-line modal-setting-subscription-skeleton-badge" />
          </div>

          <div className="modal-setting-subscription-meta">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={`subscription-skeleton-meta-${index}`}>
                <span className="skeleton-line modal-setting-subscription-skeleton-label" />
                <span className="skeleton-line modal-setting-subscription-skeleton-value" />
              </div>
            ))}
          </div>

          <div className="modal-setting-subscription-actions">
            <span className="skeleton-line modal-setting-subscription-skeleton-button" />
          </div>
        </article>
      </section>
    );
  }

  if (!subscription) {
    return (
      <section className="modal-setting-section modal-setting-billing">
        <div className="modal-setting-section-heading">
          <div>
            <h4>Abonnement actuel</h4>
            <p>Aucun abonnement actif pour cette organisation.</p>
          </div>
        </div>
        <button
          className="button primary"
          type="button"
          onClick={() => {
            navigate('/settings/plans');
            onClose();
          }}
        >
          Choisir un plan
        </button>
      </section>
    );
  }

  const status = normalizeSubscriptionStatus(subscription.status);

  return (
    <section className="modal-setting-section modal-setting-billing">
      <div className="modal-setting-section-heading">
        <div>
          <h4>Abonnement actuel</h4>
          <p>Resume de ton plan Acredi Space en cours.</p>
        </div>
      </div>

      <article className="modal-setting-subscription-card">
        <div className="modal-setting-subscription-top">
          <div>
            <span className="modal-setting-subscription-eyebrow">Plan en cours</span>
            <h3>{subscription.planName ?? 'Plan'}</h3>
            <p>{formatBillingCycle()}</p>
          </div>
          <span className="modal-setting-invite-badge modal-setting-subscription-status">
            {formatSubscriptionStatus(status)}
          </span>
        </div>

        <dl className="modal-setting-subscription-meta">
          <div>
            <dt>Statut</dt>
            <dd>{formatSubscriptionStatus(status)}</dd>
          </div>
          <div>
            <dt>Debut</dt>
            <dd>{formatBillingDate(subscription.startedAt)}</dd>
          </div>
          <div>
            <dt>Renouvellement</dt>
            <dd>{formatBillingDate(subscription.currentPeriodEnd)}</dd>
          </div>
          <div>
            <dt>Identifiant plan</dt>
            <dd>{subscription.planId}</dd>
          </div>
        </dl>

        <div className="modal-setting-subscription-actions">
          <button
            className="button primary"
            type="button"
            onClick={() => {
              navigate('/settings/plans');
              onClose();
            }}
          >
            Changer de plan
          </button>
        </div>
      </article>
    </section>
  );
}
