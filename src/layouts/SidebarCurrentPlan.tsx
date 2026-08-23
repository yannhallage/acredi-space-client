import { useCurrentSubscriptionQuery } from "../shared/api/billing";

export function SidebarCurrentPlan() {
  const { data, loading } = useCurrentSubscriptionQuery(true);
  const planName = data?.planName?.trim();

  if (loading) {
    return (
      <span
        className="sidebar-plan-name sidebar-plan-name-skeleton"
        aria-hidden="true"
      />
    );
  }

  if (!planName) {
    return null;
  }

  return (
    <span className="sidebar-plan-name" aria-label={`Plan ${planName}`}>
      {planName}
    </span>
  );
}
