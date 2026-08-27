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

  const members = checklist?.members ?? [];
  const memberIds = useMemo(
    () => new Set(members.map((member) => member.userId)),
    [members],
  );

  const searchableUsers = useMemo(() => {
    return users
      .filter((person) => person.id !== currentUser?.id)
      .filter((person) => !memberIds.has(person.id));
  }, [currentUser?.id, memberIds, users]);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());
    if (!normalizedQuery) return searchableUsers;

    return searchableUsers.filter((person) => {
      const searchable = normalizeSearch(
        [person.name, person.email, person.role, person.team]
          .filter(Boolean)
          .join(" "),
      );
      return searchable.includes(normalizedQuery);
    });
  }, [query, searchableUsers]);

  const isSearching = query.trim().length > 0;

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
          className="cl-modal-overlay"
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
            className="cl-modal cl-members-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checklist-members-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="cl-modal-head">
              <div>
                <h2 id="checklist-members-title">Participants</h2>
                <p className="cl-members-subtitle">{checklist.title}</p>
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

            <label className="cl-members-search">
              <Icon name="search" size={16} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ajouter une personne"
                disabled={isBusy}
              />
            </label>

            {loading ? (
              <div className="cl-members-hint">Chargement des utilisateurs…</div>
            ) : error ? (
              <div className="cl-members-empty">
                <strong>Impossible de charger les utilisateurs</strong>
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
            ) : isSearching ? (
              <div className="cl-members-results">
                {visibleUsers.length === 0 ? (
                  <p className="cl-members-hint">Aucun utilisateur trouvé.</p>
                ) : (
                  visibleUsers.map((person) => {
                    const isPending = pendingUserId === person.id;
                    return (
                      <button
                        key={person.id}
                        className="cl-members-add"
                        type="button"
                        disabled={isBusy}
                        onClick={() => onAdd(person)}
                      >
                        <Avatar name={person.name} size={32} />
                        <span>
                          <strong>{person.name}</strong>
                          <small>{person.email || person.role}</small>
                        </span>
                        {isPending ? (
                          <ClipLoader size={14} color="currentColor" />
                        ) : (
                          <em>Ajouter</em>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            ) : searchableUsers.length > 0 ? (
              <p className="cl-members-hint">
                {searchableUsers.length} personne
                {searchableUsers.length > 1 ? "s" : ""} disponible
                {searchableUsers.length > 1 ? "s" : ""} — tapez un nom pour
                ajouter.
              </p>
            ) : (
              <p className="cl-members-hint">
                Tous les membres de l’organisation ont déjà accès.
              </p>
            )}

            <div className="cl-members-list">
              <p>
                {members.length} participant{members.length > 1 ? "s" : ""}
              </p>
              {members.map((member) => {
                const isOwner = member.role === "OWNER";
                const isPending = pendingUserId === member.userId;

                return (
                  <div className="cl-members-row" key={member.userId}>
                    <Avatar
                      name={member.userName ?? "Utilisateur"}
                      size={32}
                      src={member.avatarUrl}
                    />
                    <span>
                      <strong>{member.userName ?? "Utilisateur"}</strong>
                    </span>
                    <em className={isOwner ? "is-owner" : undefined}>
                      {isOwner ? "Propriétaire" : "Éditeur"}
                    </em>
                    {isOwner ? (
                      <span className="cl-members-remove-spacer" />
                    ) : (
                      <button
                        className="cl-members-remove"
                        type="button"
                        aria-label={`Retirer ${member.userName ?? "le participant"}`}
                        disabled={isBusy}
                        onClick={() => onRemove(member)}
                      >
                        {isPending ? (
                          <ClipLoader size={12} color="currentColor" />
                        ) : (
                          <Icon name="x" size={14} strokeWidth={2.2} />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
