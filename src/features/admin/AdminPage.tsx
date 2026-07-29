import { useMockQuery } from '../../shared/api/useMockQuery';
import { mockApi } from '../../shared/api/mockApi';
import { LoadingState } from '../../shared/ui';
import { AdminPanel } from './components';

export function AdminPage() {
  const { data, loading } = useMockQuery(mockApi.getAdminUsers, 'admin-users');

  if (loading || !data) {
    return <LoadingState label="Chargement de l administration..." />;
  }

  return (
    <div className="page-stack">
      <AdminPanel users={data} />
    </div>
  );
}
