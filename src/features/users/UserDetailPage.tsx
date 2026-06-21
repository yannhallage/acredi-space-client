import { Navigate, useLocation, useParams } from 'react-router-dom';
import { users, workspaces } from '../../shared/api/mockData';
import type { User } from '../../shared/types';
import { Avatar, Icon } from '../../shared/ui';

function statusLabel(status: string) {
  if (status.toLowerCase().includes('reunion')) {
    return 'Occupe';
  }

  if (status.toLowerCase().includes('concentration')) {
    return 'Ne pas deranger';
  }

  if (status.toLowerCase().includes('retour')) {
    return 'Hors ligne';
  }

  return 'Disponible';
}

function userRoleLabel(user: User) {
  if (user.adminRole === 'admin' || user.adminRole === 'owner') {
    return 'Admin';
  }

  if (user.adminRole === 'manager') {
    return 'Manager';
  }

  return 'Collaborateur';
}

export function UserDetailPage() {
  const { userId } = useParams();
  const location = useLocation();
  const stateUser = (location.state as { user?: User } | null)?.user;
  const user = users.find((item) => item.id === userId) ?? (stateUser?.id === userId ? stateUser : undefined);

  if (!user) {
    return <Navigate to="/app/users" replace />;
  }

  const userTeams = workspaces.filter((workspace) => workspace.name === user.team || workspace.id === 'direction' || workspace.id === 'product');

  return (
    <div className="user-detail-page">
      <section className="user-profile-hero">
        <div className="user-profile-pattern" />
        <Avatar
          name={user.name}
          size={86}
          presence={user.presence}
          ring="var(--surface)"
          src={user.avatarUrl}
        />
        <div className="user-profile-main">
          <span>{user.team} - Acredi Group</span>
          <h1>{user.name}</h1>
          <p>{user.role} - {user.status}</p>
          <button className="user-status-pill" type="button">
            <i />
            {statusLabel(user.status)}
            <small>jusqu'a 17:00</small>
            <b>Modifier</b>
          </button>
        </div>
        <div className="user-profile-actions">
          <button className="button primary" type="button">
            <Icon name="message" size={14} />
            Message
          </button>
          <button className="button ghost" type="button">
            <Icon name="phoneOff" size={14} />
            Appeler
          </button>
        </div>
      </section>

      <section className="user-detail-grid">
        <article className="user-detail-card user-info-card">
          <h2>Informations</h2>
          <dl>
            <div>
              <Icon name="mail" size={15} />
              <dt>E-mail</dt>
              <dd>{user.email}</dd>
              <button type="button">Modifier</button>
            </div>
            <div>
              <Icon name="phoneOff" size={15} />
              <dt>Telephone</dt>
              <dd>{user.phoneNumber ?? 'Non renseigne'}</dd>
              <button type="button">Modifier</button>
            </div>
            <div>
              <Icon name="clock" size={15} />
              <dt>Fuseau</dt>
              <dd>Abidjan - GMT+0 - 09:42</dd>
              <button type="button">Modifier</button>
            </div>
            <div>
              <Icon name="message" size={15} />
              <dt>Langue</dt>
              <dd>Francais</dd>
              <button type="button">Modifier</button>
            </div>
          </dl>
        </article>

        <article className="user-detail-card">
          <h2>Mon statut</h2>
          <div className="user-status-list">
            {['Disponible', 'Occupe', 'Ne pas deranger', 'Hors ligne'].map((status, index) => (
              <button key={status} className={index === 0 ? 'active' : ''} type="button">
                <i />
                {status}
              </button>
            ))}
          </div>
          <div className="user-message-box">
            <span>MESSAGE</span>
            <strong>En revue design Acredi Space</strong>
          </div>
        </article>

        <article className="user-detail-card user-teams-card">
          <header>
            <h2>Mes equipes</h2>
            <span>{userTeams.length} equipes</span>
          </header>
          {userTeams.map((team, index) => (
            <div key={team.id} className="user-team-row">
              <span style={{ color: team.color, background: `${team.color}22` }}>
                <Icon name="users" size={15} />
              </span>
              <div>
                <strong>{team.name}</strong>
                <small>{index === 0 ? '4 membres' : '8 membres'}</small>
              </div>
              <b>{userRoleLabel(user)}</b>
            </div>
          ))}
        </article>

        <article className="user-detail-card user-preferences-card">
          <h2>Preferences</h2>
          {['Mode sombre', 'Notifications bureau', 'Notifications mobiles', 'Sons'].map((item, index) => (
            <label key={item}>
              <span>{item}</span>
              <input type="checkbox" defaultChecked={index > 0 && index < 3} />
            </label>
          ))}
        </article>
      </section>
    </div>
  );
}
