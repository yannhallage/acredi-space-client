import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { useAuth } from "../../../shared/context";
import { getFriendlyErrorMessage } from "../../../shared/feedback";
import type { Checklist, ChecklistMember } from "../../../shared/api/checklists";
import type { User } from "../../../shared/types";
import { Avatar, Icon } from "../../../shared/ui";
import { normalizeSearch } from "../utils";

type ChecklistMembersModalProps = {
  checklist: Checklist | null;
  error: Error | null;
  isBusy: boolean;
  isOpen: boolean;
  loading: boolean;
  onAdd: (user: User) => void;
  onClose: () => void;
  onRemove: (member: ChecklistMember) => void;
  onRetry: () => Promise<User[]>;
  pendingUserId: string | null;
  users: User[];
};

export function ChecklistMembersModal({
  checklist,
  error,
  isBusy,
  isOpen,
  loading,
  onAdd,
  onClose,
  onRemove,
  onRetry,
  pendingUserId,
  users,
}: ChecklistMembersModalProps) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");

  const memberIds = useMemo(
    () => new Set((checklist?.members ?? []).map((member) => member.userId)),
    [checklist?.members],
  );

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((person) => person.id !== currentUser?.id)
      .filter((person) => !memberIds.has(person.id))
      .filter((person) => {
        if (!normalizedQuery) return true;

        const searchable = normalizeSearch(
          [person.name, person.email, person.role, person.team, person.status]
            .filter(Boolean)
            .join(" "),
        );

        return searchable.includes(normalizedQuery);
      });
  }, [currentUser?.id, memberIds, query, users]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isBusy, isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && checklist ? (
        <motion.div
          className="dm-new-conversation-overlay note-share-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={() => {
            if (!isBusy) onClose();
          }}
        >
          <motion.section
            className="dm-new-conversation-modal note-share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checklist-members-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="checklist-members-title">Participants</h2>
                <small>
                  {checklist.title} — tous les participants peuvent intervenir
                  sur les tâches
                </small>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
                disabled={isBusy}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <div className="cl-members-current">
              <p>Membres actuels</p>
              {(checklist.members ?? []).map((member) => {
                const isPending = pendingUserId === member.userId;
                const canRemove = member.role !== "OWNER";

                return (
                  <div className="cl-members-row" key={member.userId}>
                    <Avatar name={member.userName ?? "Utilisateur"} size={34} />
                    <span>
                      <strong>{member.userName ?? "Utilisateur"}</strong>
                      <small>
                        {member.role === "OWNER" ? "Propriétaire" : "Éditeur"}
                      </small>
                    </span>
                    {canRemove ? (
                      <button
                        className="button danger mini"
                        type="button"
                        disabled={isBusy}
                        onClick={() => onRemove(member)}
                      >
                        {isPending ? (
                          <ClipLoader size={12} color="currentColor" />
                        ) : (
                          "Retirer"
                        )}
                      </button>
                    ) : (
                      <em>Propriétaire</em>
                    )}
                  </div>
                );
              })}
            </div>

            <label className="dm-new-conversation-search">
              <Icon name="search" size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ajouter un utilisateur de l'organisation..."
                disabled={isBusy}
              />
            </label>

            <div className="dm-new-conversation-list">
              <p>Utilisateurs</p>
              {loading
                ? ["checklist-share-loading-1", "checklist-share-loading-2"].map(
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
                    const isSelected = pendingUserId === person.id;

                    return (
                      <button
                        key={person.id}
                        className="dm-new-conversation-user note-share-user"
                        type="button"
                        disabled={isBusy}
                        onClick={() => onAdd(person)}
                      >
                        {isSelected ? (
                          <ClipLoader size={14} color="currentColor" />
                        ) : (
                          <Icon name="plus" size={16} />
                        )}
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
                          {person.status}
                        </em>
                      </button>
                    );
                  })}

              {!loading && error ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="alert" size={18} />
                  <strong>Chargement impossible</strong>
                  <span>
                    {getFriendlyErrorMessage(
                      error,
                      "Nous n’avons pas pu charger les utilisateurs.",
                    )}
                  </span>
                  <button
                    className="button ghost mini"
                    type="button"
                    onClick={() => {
                      onRetry().catch(() => undefined);
                    }}
                    disabled={isBusy}
                  >
                    Réessayer
                  </button>
                </div>
              ) : null}

              {!loading && !error && visibleUsers.length === 0 ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="users" size={18} />
                  <strong>Aucun utilisateur trouvé</strong>
                  <span>
                    Tous les membres de l’organisation sont déjà participants,
                    ou essayez un autre nom.
                  </span>
                </div>
              ) : null}
            </div>

            <footer className="dm-new-conversation-footer">
              <span>
                <Icon name="checklists" size={14} />
                {checklist.members.length} membre(s)
              </span>
              <button
                className="button primary"
                type="button"
                onClick={onClose}
                disabled={isBusy}
              >
                Fermer
              </button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
