import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useUserTeamsQuery } from '../../shared/api/teams';
import { useUserQuery } from '../../shared/api/users';
import type { Presence } from '../../shared/types';
import { Avatar, Icon } from '../../shared/ui';
import { presenceLabel, roleLabel, themePreferenceLabel } from './utils';

const PRESENCE_OPTIONS: Presence[] = ['online', 'busy', 'dnd', 'offline'];

export function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const userQuery = useUserQuery({ userId });
  const teamsQuery = useUserTeamsQuery({
    userId,
    enabled: Boolean(userId),
  });

  const user = userQuery.data;
  const teams = teamsQuery.data ?? [];

  if (!userId) {
    return <Navigate to="/app/users" replace />;
  }

  if (userQuery.loading) {
    return (
      <div className="user-detail-page">
        <button
          className="user-detail-back-button"
          type="button"
          onClick={() => navigate('/app/users')}
        >
          <Icon name="arrowLeft" size={13} />
          Retour aux utilisateurs
        </button>
        <section className="user-detail-card user-detail-state">
          <p>Chargement du profil...</p>
        </section>
      </div>
    );
  }

  if (userQuery.error || !user) {
    return (
      <div className="user-detail-page">
        <button
          className="user-detail-back-button"
          type="button"
          onClick={() => navigate('/app/users')}
        >
          <Icon name="arrowLeft" size={13} />
          Retour aux utilisateurs
        </button>
        <section className="user-detail-card user-detail-state">
          <Icon name="alert" size={18} />
          <p>{userQuery.error?.message ?? 'Utilisateur introuvable.'}</p>
          <button
            className="button ghost mini"
            type="button"
            onClick={() => {
              void userQuery.refetch();
            }}
          >
            Reessayer
          </button>
        </section>
      </div>
    );
  }

  const profileName =
    typeof user.profile === 'string'
      ? user.profile
      : typeof user.profile === 'object' && user.profile
        ? user.profile.role || user.role
        : user.role;
  const teamLabel = user.team || 'Sans equipe';

  return (
    <div className="user-detail-page">
      <button
        className="user-detail-back-button"
        type="button"
        onClick={() => navigate('/app/users')}
      >
        <Icon name="arrowLeft" size={13} />
        Retour aux utilisateurs
      </button>

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
          <span>
            {teamLabel} - {roleLabel(user)}
          </span>
          <h1>{user.name}</h1>
          <p>
            {profileName}
            {user.enabled === false ? ' - Compte desactive' : ''}
          </p>
          <button className="user-status-pill" type="button" disabled>
            <i data-presence={user.presence} />
            {presenceLabel(user.presence)}
          </button>
        </div>
        <div className="user-profile-actions">
          <button className="button primary" type="button" disabled title="Bientot disponible">
            <Icon name="message" size={14} />
            Message
          </button>
          <button className="button ghost" type="button" disabled title="Bientot disponible">
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
            </div>
            <div>
              <Icon name="phoneOff" size={15} />
              <dt>Telephone</dt>
              <dd>{user.phoneNumber?.trim() || 'Non renseigne'}</dd>
            </div>
            <div>
              <Icon name="shield" size={15} />
              <dt>Role</dt>
              <dd>{roleLabel(user)}</dd>
            </div>
            <div>
              <Icon name="users" size={15} />
              <dt>Profil</dt>
              <dd>{profileName || 'Non renseigne'}</dd>
            </div>
            <div>
              <Icon name="check" size={15} />
              <dt>Statut compte</dt>
              <dd>
                {user.enabled === false ? 'Desactive' : 'Active'}
                {user.invitationStatus ? ` • ${user.invitationStatus}` : ''}
              </dd>
            </div>
          </dl>
        </article>

        <article className="user-detail-card">
          <h2>Presence</h2>
          <div className="user-status-list">
            {PRESENCE_OPTIONS.map((presence) => (
              <button
                key={presence}
                className={user.presence === presence ? 'active' : ''}
                type="button"
                disabled
              >
                <i data-presence={presence} />
                {presenceLabel(presence)}
              </button>
            ))}
          </div>
          <div className="user-message-box">
            <span>EQUIPE</span>
            <strong>{teamLabel}</strong>
          </div>
        </article>

        <article className="user-detail-card user-teams-card">
          <header>
            <h2>Equipes</h2>
            <span>
              {teamsQuery.loading
                ? 'Chargement...'
                : `${teams.length} equipe${teams.length > 1 ? 's' : ''}`}
            </span>
          </header>

          {teamsQuery.error ? (
            <div className="user-detail-inline-state error">
              <Icon name="alert" size={16} />
              <span>{teamsQuery.error.message}</span>
            </div>
          ) : null}

          {!teamsQuery.loading && !teamsQuery.error && teams.length === 0 ? (
            <div className="user-detail-inline-state">
              <Icon name="users" size={16} />
              <span>Cet utilisateur n appartient a aucune equipe.</span>
            </div>
          ) : null}

          {teams.map((team) => (
            <div key={team.id} className="user-team-row">
              <span
                style={{
                  color: team.teamColor || 'var(--accent)',
                  background: `${team.teamColor || 'var(--accent)'}22`,
                }}
              >
                <Icon name="users" size={15} />
              </span>
              <div>
                <strong>{team.name}</strong>
                <small>{team.description?.trim() || team.slug || 'Sans description'}</small>
              </div>
              <b>{roleLabel(user)}</b>
            </div>
          ))}
        </article>

        <article className="user-detail-card user-preferences-card">
          <h2>Preferences</h2>
          <dl className="user-preferences-list">
            <div>
              <dt>Theme</dt>
              <dd>{themePreferenceLabel(user.appThemePreference)}</dd>
            </div>
            <div>
              <dt>Onboarding</dt>
              <dd>{user.onboardingStatus || 'Non renseigne'}</dd>
            </div>
            <div>
              <dt>Invitation</dt>
              <dd>{user.invitationStatus || 'Non renseigne'}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
