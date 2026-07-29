import { useNavigate } from 'react-router-dom';
import { CURRENT_SUBSCRIPTION } from '../../billing/data';
import { formatBillingDate, formatSubscriptionStatus } from '../../utils';

type SubscriptionSectionProps = {
  onClose: () => void;
};

export function SubscriptionSection({ onClose }: SubscriptionSectionProps) {
  const navigate = useNavigate();

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
            <h3>{CURRENT_SUBSCRIPTION.planName}</h3>
            <p>{CURRENT_SUBSCRIPTION.priceLabel}</p>
          </div>
          <span className="modal-setting-invite-badge modal-setting-subscription-status">
            {formatSubscriptionStatus(CURRENT_SUBSCRIPTION.status)}
          </span>
        </div>

        <dl className="modal-setting-subscription-meta">
          <div>
            <dt>Cycle</dt>
            <dd>{CURRENT_SUBSCRIPTION.billingCycle}</dd>
          </div>
          <div>
            <dt>Sieges</dt>
            <dd>
              {CURRENT_SUBSCRIPTION.seatsUsed} / {CURRENT_SUBSCRIPTION.seats}
            </dd>
          </div>
          <div>
            <dt>Debut</dt>
            <dd>{formatBillingDate(CURRENT_SUBSCRIPTION.startedAt)}</dd>
          </div>
          <div>
            <dt>Renouvellement</dt>
            <dd>{formatBillingDate(CURRENT_SUBSCRIPTION.renewsAt)}</dd>
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
