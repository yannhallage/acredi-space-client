import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { useAuth } from "../../context";
import type { User } from "../../types";
import { Avatar, Icon } from "../../ui";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

interface MessageShareModalProps {
  open: boolean;
  loading: boolean;
  error: Error | null;
  users: User[];
  sharingUserId?: string | null;
  onClose: () => void;
  onRetry: () => void;
  onSelect: (user: User) => void;
}

export function MessageShareModal({
  open,
  loading,
  error,
  users,
  sharingUserId = null,
  onClose,
  onRetry,
  onSelect,
}: MessageShareModalProps) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const isSharing = Boolean(sharingUserId);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((person) => person.id !== currentUser?.id)
      .filter((person) => {
        if (!normalizedQuery) return true;

        const searchable = normalizeSearch(
          [person.name, person.email, person.role, person.team, person.status]
            .filter(Boolean)
            .join(" "),
        );

        return searchable.includes(normalizedQuery);
      });
  }, [currentUser?.id, query, users]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSharing) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isSharing, onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="dm-new-conversation-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={() => {
            if (!isSharing) onClose();
          }}
        >
          <motion.section
            className="dm-new-conversation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-share-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="message-share-title">Partager le message</h2>
                <small>Selectionnez un utilisateur</small>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                disabled={isSharing}
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
                disabled={isSharing}
              />
            </label>

            <div className="dm-new-conversation-list">
              <p>Utilisateurs</p>
              {loading
                ? ["message-share-loading-1", "message-share-loading-2"].map(
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
                : visibleUsers.map((person) => {
                    const isSelected = sharingUserId === person.id;

                    return (
                      <button
                        key={person.id}
                        className="dm-new-conversation-user"
                        type="button"
                        disabled={isSharing}
                        onClick={() => onSelect(person)}
                      >
                        {isSelected ? (
                          <ClipLoader size={14} color="currentColor" />
                        ) : (
                          <Icon name="share" size={16} />
                        )}
                        <Avatar
                          name={person.name}
                          presence={person.presence}
                          size={34}
                          src={person.avatarUrl}
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
                          {person.status}
                        </em>
                      </button>
                    );
                  })}

              {!loading && error ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="alert" size={18} />
                  <strong>Chargement impossible</strong>
                  <span>{error.message}</span>
                  <button
                    className="button ghost mini"
                    type="button"
                    onClick={onRetry}
                    disabled={isSharing}
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
                <Icon name="share" size={14} />
                Partage de message
              </span>
              <small>{visibleUsers.length} utilisateur(s)</small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
