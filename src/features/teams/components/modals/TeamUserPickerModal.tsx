import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Avatar, Icon } from "../../../../shared/ui";
import type { User } from "../../../../shared/types";
import { normalizeSearch, userPresenceLabel } from "../../utils";

export function TeamUserPickerModal({
  isOpen,
  loading,
  onClose,
  onRetry,
  onSelect,
  selectedUserIds,
  users,
  error,
}: {
  error: Error | null;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onRetry: () => Promise<User[]>;
  onSelect: (user: User) => void;
  selectedUserIds: Set<string>;
  users: User[];
}) {
  const [query, setQuery] = useState("");

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((user) => !selectedUserIds.has(user.id))
      .filter((user) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = normalizeSearch(
          [user.name, user.email, user.role, user.team, user.status].join(" "),
        );

        return searchable.includes(normalizedQuery);
      });
  }, [query, selectedUserIds, users]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="dm-new-conversation-overlay team-user-picker-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="dm-new-conversation-modal team-user-picker-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-user-picker-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="team-user-picker-title">Ajouter un utilisateur</h2>
                <small>{visibleUsers.length} contacts disponibles</small>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <label className="dm-new-conversation-search">
              <Icon name="search" size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un utilisateur..."
              />
            </label>

            <div className="dm-new-conversation-list">
              <p>Utilisateurs</p>
              {loading
                ? ["team-picker-loading-1", "team-picker-loading-2"].map(
                    (item) => (
                      <div
                        className="dm-new-conversation-user team-picker-row-skeleton"
                        key={item}
                      >
                        <span className="skeleton-dot" />
                        <span className="skeleton-avatar" />
                        <span>
                          <span className="skeleton-line" />
                          <span className="skeleton-line skeleton-short" />
                        </span>
                        <span className="skeleton-pill" />
                      </div>
                    ),
                  )
                : visibleUsers.map((person) => (
                    <button
                      key={person.id}
                      className="dm-new-conversation-user"
                      type="button"
                      onClick={() => {
                        onSelect(person);
                        onClose();
                      }}
                    >
                      <Icon name="plus" size={16} />
                      <Avatar
                        name={person.name}
                        presence={person.presence}
                        size={34}
                      />
                      <span>
                        <strong>{person.name}</strong>
                        <small>
                          {person.role} - {person.team}
                        </small>
                      </span>
                      <em
                        className={`dm-new-conversation-status presence-${person.presence}`}
                      >
                        {userPresenceLabel(person)}
                      </em>
                    </button>
                  ))}

              {!loading && error ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="alert" size={18} />
                  <strong>Chargement impossible</strong>
                  <span>{error.message}</span>
                  <button
                    className="button ghost mini"
                    type="button"
                    onClick={() => {
                      onRetry().catch(() => undefined);
                    }}
                  >
                    Reessayer
                  </button>
                </div>
              ) : null}

              {!loading && !error && visibleUsers.length === 0 ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="users" size={18} />
                  <strong>Aucun utilisateur trouve</strong>
                  <span>Essayez un autre nom, email ou role.</span>
                </div>
              ) : null}
            </div>

            <footer className="dm-new-conversation-footer">
              <span>
                <Icon name="users" size={14} />
                TeamMember
              </span>
              <small>{selectedUserIds.size} selectionne(s)</small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
