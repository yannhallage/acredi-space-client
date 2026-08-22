import { useMemo, useState } from "react";

import { useUsersQuery } from "../../../../shared/api/users/hooks";
import { Icon } from "../../../../shared/ui";

type PollParticipantsPanelProps = {
  canManage: boolean;
  isInviting?: boolean;
  onInvite: (userIds: string[]) => Promise<void>;
  responseCount: number;
};

export function PollParticipantsPanel({
  canManage,
  isInviting = false,
  onInvite,
  responseCount,
}: PollParticipantsPanelProps) {
  const usersQuery = useUsersQuery({ enabled: canManage });
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const users = usersQuery.data ?? [];

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return users.slice(0, 8);
    }

    return users
      .filter((user) => {
        return (
          (user.name ?? "").toLowerCase().includes(normalized) ||
          (user.email ?? "").toLowerCase().includes(normalized)
        );
      })
      .slice(0, 8);
  }, [query, users]);

  function toggleUser(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  return (
    <div className="pd-panel">
      <header className="pd-panel-header">
        <div>
          <h3>Participants</h3>
          <p className="pd-muted">{responseCount} réponse(s) reçue(s)</p>
        </div>
      </header>

      {canManage ? (
        <>
          <label className="pd-search">
            <Icon name="search" size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un collaborateur"
            />
          </label>

          <ul className="pd-invite-list">
            {filteredUsers.map((user) => {
              const selected = selectedIds.includes(user.id);

              return (
                <li key={user.id}>
                  <button
                    type="button"
                    className={
                      selected
                        ? "pd-invite-item pd-invite-item-selected"
                        : "pd-invite-item"
                    }
                    onClick={() => toggleUser(user.id)}
                  >
                    <span>{user.name || user.email}</span>
                    <small>{user.email}</small>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            className="button primary"
            type="button"
            disabled={selectedIds.length === 0 || isInviting}
            onClick={() => {
              onInvite(selectedIds)
                .then(() => setSelectedIds([]))
                .catch(() => undefined);
            }}
          >
            Inviter ({selectedIds.length})
          </button>
        </>
      ) : (
        <p className="pd-muted">
          Les invitations sont gérées par le créateur ou un manager.
        </p>
      )}
    </div>
  );
}
