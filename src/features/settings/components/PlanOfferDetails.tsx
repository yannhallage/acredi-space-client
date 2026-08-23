import { Icon } from '../../../shared/ui';
import {
  planCatalogFeatureLines,
  planCatalogLimitLines,
  type PlanCatalogItem,
} from '../../../shared/billing/planCatalog';

interface PlanOfferDetailsProps {
  item: PlanCatalogItem;
  current?: boolean;
}

function formatPlanAmount(amount: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount);
}

export function PlanOfferDetails({ item, current = false }: PlanOfferDetailsProps) {
  const isFree = item.price.monthly === 0;

  return (
    <>
      <div className="plan-card-top">
        {item.key === 'pro' && !current ? (
          <span className="plan-badge">Populaire</span>
        ) : null}
        {current ? (
          <div className="plan-card-labels">
            <span className="plan-tag current">Plan actuel</span>
          </div>
        ) : null}
        <h2>{item.name}</h2>
        <p>{item.description}</p>
      </div>

      <div className="plan-price">
        {isFree ? (
          <strong>Gratuit</strong>
        ) : (
          <>
            <strong>{formatPlanAmount(item.price.monthly)}</strong>
            <span className="plan-price-unit">F CFA</span>
          </>
        )}
        <span className="plan-price-interval">/ mois</span>
      </div>

      <ul className="plan-features">
        {planCatalogLimitLines(item).map((line) => (
          <li key={line}>
            <Icon name="check" size={14} />
            <span>{line}</span>
          </li>
        ))}
        {planCatalogFeatureLines(item).map((feature) => (
          <li key={feature.key} className={feature.included ? undefined : 'unavailable'}>
            <Icon name={feature.included ? 'check' : 'x'} size={14} />
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>
    </>
  );
}
