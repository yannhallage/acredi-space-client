import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import type { TeamResponse } from "../../api/teams";
import { useAuth } from "../../context";
import type { User } from "../../types";
import { Avatar, Icon } from "../../ui";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export type MessageShareTarget =
  | { type: "user"; user: User }
  | { type: "team"; team: TeamResponse };

interface MessageShareModalProps {
  open: boolean;
  loading: boolean;
  error: Error | null;
  users: User[];
  teams?: TeamResponse[];
  sharingTargetId?: string | null;
  onClose: () => void;
  onRetry: () => void;
  onSelect: (target: MessageShareTarget) => void;
}

export function MessageShareModal({
  open,
  loading,
  error,
  users,
  teams = [],
  sharingTargetId = null,
  onClose,
  onRetry,
  onSelect,
}: MessageShareModalProps) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const isSharing = Boolean(sharingTargetId);

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

  const visibleTeams = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return teams.filter((team) => {
      if (!normalizedQuery) return true;

      const searchable = normalizeSearch(
        [team.name, team.description, team.slug, team.ownerName]
          .filter(Boolean)
          .join(" "),
      );

      return searchable.includes(normalizedQuery);
    });
  }, [query, teams]);

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
                <small>Selectionnez un utilisateur ou une equipe</small>
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
                placeholder="Rechercher un utilisateur ou une equipe..."
                disabled={isSharing}
              />
            </label>

            <div className="dm-new-conversation-list message-share-list">
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

              {loading ? (
                ["message-share-loading-1", "message-share-loading-2"].map(
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
              ) : (
                <>
                  <div className="message-share-section">
                    <p className="message-share-section-label">
                      <Icon name="user" size={13} />
                      Utilisateurs
                      <em>{visibleUsers.length}</em>
                    </p>

                    {visibleUsers.map((person) => {
                      const isSelected = sharingTargetId === person.id;

                      return (
                        <button
                          key={person.id}
                          className="dm-new-conversation-user message-share-user-row"
                          type="button"
                          disabled={isSharing}
                          onClick={() => onSelect({ type: "user", user: person })}
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

                    {!error && visibleUsers.length === 0 ? (
                      <div className="message-share-section-empty">
                        Aucun utilisateur trouve
                      </div>
                    ) : null}
                  </div>

                  <div className="message-share-section">
                    <p className="message-share-section-label message-share-section-label-team">
                      <Icon name="users" size={13} />
                      Equipes
                      <em>{visibleTeams.length}</em>
                    </p>

                    {visibleTeams.map((team) => {
                      const isSelected = sharingTargetId === team.id;

                      return (
                        <button
                          key={team.id}
                          className="dm-new-conversation-user message-share-team-row"
                          type="button"
                          disabled={isSharing}
                          onClick={() => onSelect({ type: "team", team })}
                        >
                          {isSelected ? (
                            <ClipLoader size={14} color="currentColor" />
                          ) : (
                            <Icon name="share" size={16} />
                          )}
                          <Avatar
                            name={team.name}
                            size={34}
                            src={team.avatarUrl}
                          />
                          <span>
                            <strong>{team.name}</strong>
                            <small>
                              {team.description?.trim() ||
                                `Proprietaire: ${team.ownerName}`}
                            </small>
                          </span>
                          <em className="message-share-team-badge">Equipe</em>
                        </button>
                      );
                    })}

                    {!error && visibleTeams.length === 0 ? (
                      <div className="message-share-section-empty">
                        Aucune equipe trouvee
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            <footer className="dm-new-conversation-footer">
              <span>
                <Icon name="share" size={14} />
                Partage de message
              </span>
              <small>
                {visibleUsers.length} utilisateur(s) · {visibleTeams.length}{" "}
                equipe(s)
              </small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
