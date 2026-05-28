import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInviteUserMutation, useUsersQuery } from '../../shared/api/users';
import { useAuth } from '../../shared/context';
import type { AdminRole, User } from '../../shared/types';
import { Icon, type IconName } from '../../shared/ui';
import { NotUsers } from './components/NotUsers';

const roleOptions: Array<{ value: AdminRole; label: string }> = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'collaborator', label: 'Collaborator' }
];
const userSkeletons = ['user-skeleton-1', 'user-skeleton-2', 'user-skeleton-3', 'user-skeleton-4', 'user-skeleton-5'];

function roleLabel(user: User) {
  if (user.adminRole === 'admin' || user.adminRole === 'owner') {
    return 'Admin';
  }

  if (user.adminRole === 'manager') {
    return 'Manager';
  }

  return 'Collaborator';
}

function roleIcon(user: User): IconName {
  return user.adminRole === 'admin' || user.adminRole === 'owner' ? 'shield' : 'users';
}

function initialsFor(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 1)
    .join('')
    .toUpperCase();
}

function UserRowSkeleton() {
  return (
    <article className="users-row users-row-skeleton" aria-hidden="true">
      <span className="skeleton-avatar users-initial" />
      <div className="users-person">
        <span className="skeleton-line skeleton-user-name" />
        <span className="skeleton-line skeleton-user-email" />
      </div>
      <span className="skeleton-pill" />
      <span className="skeleton-more" />
    </article>
  );
}

function hasPermission(
  permissions: ReturnType<typeof useAuth>['permissions'],
  codes: string[]
) {
  if (!permissions) {
    return false;
  }

  const normalizedRole = (permissions.role ?? '').toUpperCase();

  if (normalizedRole === 'ADMIN' || normalizedRole === 'OWNER') {
    return true;
  }

  return (permissions.features ?? []).some((feature) =>
    codes.includes(feature.code) || codes.includes(feature.name)
  );
}

function hasAdminAccess(user: User | null) {
  const role = (user?.role ?? '').toUpperCase();

  return (
    user?.adminRole === 'admin' ||
    user?.adminRole === 'owner' ||
    role === 'ADMIN' ||
    role === 'OWNER'
  );
}

export function UsersPage() {
  const navigate = useNavigate();
  const { loading: authLoading, permissions, user: currentUser } = useAuth();
  const canViewUsers = hasAdminAccess(currentUser) || hasPermission(permissions, ['users.view_all', 'VIEW_ALL_USERS', 'users.manage_accounts', 'MANAGE_ACCOUNTS']);
  const canInviteUsers = hasAdminAccess(currentUser) || hasPermission(permissions, ['users.invite_collaborators', 'INVITE_COLLABORATORS', 'users.create', 'CREATE_USERS', 'users.manage_accounts', 'MANAGE_ACCOUNTS']);
  const usersQuery = useUsersQuery({ enabled: !authLoading && canViewUsers });
  const inviteMutation = useInviteUserMutation();
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('collaborator');
  const loading = authLoading || usersQuery.loading;

  const visibleUsers = useMemo(() => {
    const nameQuery = nameFilter.trim().toLowerCase();
    const emailQuery = emailFilter.trim().toLowerCase();
    const users = usersQuery.data ?? [];

    return users
      .filter((user) => {
        const matchesName = nameQuery.length === 0 || user.name.toLowerCase().includes(nameQuery);
        const matchesEmail = emailQuery.length === 0 || user.email.toLowerCase().includes(emailQuery);
        return matchesName && matchesEmail;
      })
      .slice()
      .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  }, [emailFilter, nameFilter, sortAsc, usersQuery.data]);

  const hasFilters = nameFilter.trim().length > 0 || emailFilter.trim().length > 0;

  function closeInvite() {
    setIsInviteOpen(false);
    inviteMutation.reset();
    setName('');
    setEmail('');
    setRole('collaborator');
  }

  async function inviteUser() {
    const nextName = name.trim();
    const nextEmail = email.trim();

    if (!nextName || !nextEmail) {
      return;
    }

    const [firstName, ...lastNameParts] = nextName.split(/\s+/);

    await inviteMutation.mutateAsync({
      email: nextEmail,
      firstName,
      lastName: lastNameParts.join(' '),
      name: nextName,
      role: role.toUpperCase()
    });
    await usersQuery.refetch();
    closeInvite();
  }

  return (
    <div className="page-stack users-page">
      <div className="page-header compact">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Utilisateurs</h1>
          <p>Gérez les comptes, rôles et accès de votre application.</p>
        </div>
        <button
          className="button primary notes-create-button"
          type="button"
          disabled={authLoading || !canInviteUsers}
          onClick={() => {
            if (!canInviteUsers) {
              return;
            }

            inviteMutation.reset();
            setIsInviteOpen(true);
          }}
        >
          <Icon name="plus" size={12} />
          Create
        </button>
      </section>

      <section className="notes-filters" aria-label="Users filters">
        <div className="notes-filter-inputs">
          <label>
            <span>Name</span>
            <input value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} placeholder="Name" />
          </label>
          <label>
            <span>Email</span>
            <input value={emailFilter} onChange={(event) => setEmailFilter(event.target.value)} placeholder="Email" />
          </label>
        </div>
        <div className="notes-filter-actions">
          <button
            className="icon-button bordered"
            type="button"
            aria-label="Refresh users"
            disabled={authLoading || !canViewUsers}
            onClick={() => {
              setNameFilter('');
              setEmailFilter('');
              usersQuery.refetch().catch(() => undefined);
            }}
          >
            <Icon name="refresh" size={14} />
          </button>
          <button className="button ghost" type="button">
            <Icon name="filter" size={14} />
            Filter
          </button>
          <button className="button ghost" type="button" onClick={() => setSortAsc((current) => !current)}>
            <Icon name="sort" size={14} />
            Sort
          </button>
          <button className="icon-button bordered" type="button" aria-label="More actions">
            <Icon name="moreH" size={14} />
          </button>
        </div>
      </section>

      <section
        className={
          !loading && visibleUsers.length === 0
            ? 'users-list users-list-empty'
            : 'users-list'
        }
        aria-label="Users list"
      >
        {loading ? userSkeletons.map((item) => <UserRowSkeleton key={item} />) : visibleUsers.map((user) => (
          <motion.article
            className="users-row"
            key={user.id}
            role="button"
            tabIndex={0}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            onClick={() => navigate(`/app/users/${user.id}`, { state: { user } })}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate(`/app/users/${user.id}`, { state: { user } });
              }
            }}
          >
            <span className="users-initial">{initialsFor(user.name)}</span>
            <div className="users-person">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button className="users-role" type="button" onClick={(event) => event.stopPropagation()}>
              <Icon name={roleIcon(user)} size={15} />
              {roleLabel(user)}
            </button>
            <button
              className="icon-button users-more"
              type="button"
              aria-label={`Options ${user.name}`}
              onClick={(event) => event.stopPropagation()}
            >
              <Icon name="moreH" size={15} />
            </button>
          </motion.article>
        ))}
        {!loading && visibleUsers.length === 0 ? (
          <NotUsers
            hasFilters={hasFilters}
            message={
              canViewUsers
                ? usersQuery.error?.message
                : "Vous n'avez pas les droits necessaires pour afficher les utilisateurs."
            }
          />
        ) : null}
      </section>

      <AnimatePresence>
        {isInviteOpen ? (
          <motion.div
            className="note-modal-overlay"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onMouseDown={closeInvite}
          >
            <motion.form
            className="note-modal users-note-modal"
            aria-label="Invite user"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              inviteUser().catch(() => undefined);
            }}
          >
            <header>
              <h2>Invite user</h2>
              <div>
                <button className="icon-button" type="button" aria-label="Close invite user" onClick={closeInvite}>
                  <Icon name="x" size={16} />
                </button>
              </div>
            ))}

            <label className="note-field">
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" autoFocus />
            </label>

            <label className="note-field">
              <span>Email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" type="email" />
            </label>

            <label className="note-field">
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {inviteMutation.error ? (
              <p className="auth-error text-red-500 text-sm">{inviteMutation.error.message}</p>
            ) : null}

            <footer>
              <button className="button ghost" type="button" onClick={closeInvite}>
                Cancel
              </button>
              <button
                className="button primary notes-submit"
                type="submit"
                disabled={!name.trim() || !email.trim() || inviteMutation.isPending}
              >
                {inviteMutation.isPending ? 'Invitation...' : 'Invite'}
              </button>
            </footer>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}