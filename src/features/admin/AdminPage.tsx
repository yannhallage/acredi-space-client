import { mockApi, useMockQuery } from '../../shared/api';
import { Avatar, Card, Icon, LoadingState } from '../../shared/ui';

const roleLabels = {
  owner: 'Proprietaire',
  admin: 'Admin',
  member: 'Membre',
  guest: 'Invite'
};

export function AdminPage() {
  const { data, loading } = useMockQuery(mockApi.getAdminUsers, 'admin-users');

  if (loading || !data) {
    return <LoadingState label="Chargement de l administration..." />;
  }

  return (
    <div className="page-stack">
      <header className="page-header compact">
        <div>
          <p className="eyebrow">Parametres</p>
          <h1>Administration Acredi Space</h1>
          <p>Gestion des membres, roles, securite et limites de workspace.</p>
        </div>
        <button className="button primary" type="button"><Icon name="plus" size={14} /> Inviter un membre</button>
      </header>

      <section className="admin-stats">
        <Card><strong>{data.length}</strong><span>Membres</span></Card>
        <Card><strong>4</strong><span>Espaces actifs</span></Card>
        <Card><strong>98%</strong><span>Securite</span></Card>
        <Card><strong>1.2 To</strong><span>Stockage</span></Card>
      </section>

      <Card title="Membres et permissions">
        <div className="admin-table">
          <div className="admin-table-head">
            <span>Membre</span>
            <span>Equipe</span>
            <span>Role</span>
            <span>Statut</span>
            <span />
          </div>
          {data.map((user) => (
            <div key={user.id} className="admin-row">
              <span className="admin-person"><Avatar name={user.name} size={32} presence={user.presence} /><b>{user.name}</b><small>{user.email}</small></span>
              <span>{user.team}</span>
              <span className={`role-pill role-${user.adminRole}`}>{roleLabels[user.adminRole]}</span>
              <span>{user.status}</span>
              <button className="icon-button" type="button" aria-label={`Options ${user.name}`}><Icon name="moreH" size={14} /></button>
            </div>
          ))}
        </div>
      </Card>

      <section className="dashboard-grid narrow">
        <Card title="Securite workspace">
          <ul className="settings-list">
            <li><Icon name="shield" size={16} /><span>SSO mock</span><strong>Actif</strong></li>
            <li><Icon name="lock" size={16} /><span>Politiques fichiers</span><strong>Strictes</strong></li>
            <li><Icon name="alert" size={16} /><span>Alertes admin</span><strong>3 ouvertes</strong></li>
          </ul>
        </Card>
        <Card title="Integrations">
          <ul className="settings-list">
            <li><Icon name="building" size={16} /><span>Drive interne</span><strong>Connecte</strong></li>
            <li><Icon name="calendar" size={16} /><span>Calendrier</span><strong>Connecte</strong></li>
            <li><Icon name="message" size={16} /><span>Webhooks chat</span><strong>Mock</strong></li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
