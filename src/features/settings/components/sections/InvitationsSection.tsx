import { useMemo } from 'react';
import { useUsersQuery } from '../../../../shared/api/users';
import { Avatar, Icon } from '../../../../shared/ui';
import { formatInviteRole, isPendingInvitation } from '../../utils';

export function InvitationsSection() {
  const pendingInvitesQuery = useUsersQuery({ enabled: true });
  const pendingInvitations = useMemo(
    () => (pendingInvitesQuery.data ?? []).filter(isPendingInvitation),
    [pendingInvitesQuery.data]
  );

  return (
    <section className="modal-setting-section modal-setting-invitations">
      <div className="modal-setting-section-heading">
        <div>
          <h4>Invitations en attente</h4>
          <p>Utilisateurs invites qui n ont pas encore finalise leur compte.</p>
        </div>
        <button
          className="button ghost mini"
          type="button"
          onClick={() => pendingInvitesQuery.refetch().catch(() => undefined)}
          disabled={pendingInvitesQuery.loading}
        >
          {pendingInvitesQuery.loading ? 'Chargement...' : 'Actualiser'}
        </button>
      </div>

      {pendingInvitesQuery.error ? (
        <div className="modal-setting-inline-state error">
          <Icon name="alert" size={16} />
          <span>{pendingInvitesQuery.error.message}</span>
        </div>
      ) : null}

      <div
        className="modal-setting-profile-table modal-setting-invite-table"
        role="table"
        aria-label="Invitations en attente"
      >
        <div className="modal-setting-profile-table-head modal-setting-invite-row" role="row">
          <span role="columnheader">Utilisateur</span>
          <span role="columnheader">Email</span>
          <span role="columnheader">Role</span>
          <span role="columnheader">Statut</span>
        </div>

        {pendingInvitesQuery.loading
          ? ['invite-skeleton-1', 'invite-skeleton-2', 'invite-skeleton-3'].map((item) => (
              <div
                className="modal-setting-profile-row modal-setting-invite-row skeleton"
                key={item}
                role="row"
              >
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
                <span className="skeleton-line" />
              </div>
            ))
          : null}

        {!pendingInvitesQuery.loading &&
        pendingInvitations.length === 0 &&
        !pendingInvitesQuery.error ? (
          <div className="modal-setting-profile-empty">
            <Icon name="mail" size={16} />
            <strong>Aucune invitation en attente</strong>
            <span>Les invitations ouvertes apparaitront ici.</span>
          </div>
        ) : null}

        {!pendingInvitesQuery.loading
          ? pendingInvitations.map((invite) => (
              <div
                className="modal-setting-profile-row modal-setting-invite-row"
                key={invite.id}
                role="row"
              >
                <div className="modal-setting-invite-user" role="cell">
                  <Avatar
                    name={invite.name || invite.email}
                    size={32}
                    presence={invite.presence}
                    src={invite.avatarUrl}
                  />
                  <strong>{invite.name || invite.email}</strong>
                </div>
                <span role="cell">{invite.email}</span>
                <span role="cell">{formatInviteRole(invite)}</span>
                <span role="cell">
                  <span className="modal-setting-invite-badge">En attente</span>
                </span>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
