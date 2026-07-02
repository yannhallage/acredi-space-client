import { mockApi } from '../../shared/api/mockApi';
import { useMockQuery } from '../../shared/api/useMockQuery';
import { LoadingState } from '../../shared/ui';
import { NotificationsPanel } from './components';

export function NotificationsPage() {
  const { data, loading } = useMockQuery(mockApi.getNotifications, 'notifications');

  if (loading || !data) {
    return <LoadingState label="Chargement des notifications..." />;
  }

  return (
    <div className="page-stack">
      <NotificationsPanel notifications={data} />
    </div>
  );
}
