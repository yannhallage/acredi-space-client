import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CalendarEvent } from "../../../../shared/api/callendar/types";
import { useUsersQuery } from "../../../../shared/api/users";
import type { User } from "../../../../shared/types";
import { Avatar, Icon } from "../../../../shared/ui";
import { normalizeSearch } from "../../utils";

type CalendarParticipantsModalProps = {
  error: Error | null;
  event: CalendarEvent;
  isSaving: boolean;
  onClose: () => void;
  onSave: (participantIds: string[]) => Promise<void>;
};

export function CalendarParticipantsModal({
  error,
  event,
  isSaving,
  onClose,
  onSave,
}: CalendarParticipantsModalProps) {
  const usersQuery = useUsersQuery();
  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    event.participants.map((participant) => participant.id),
  );

  useEffect(() => {
    setQuery("");
    setSelectedIds(event.participants.map((participant) => participant.id));
  }, [event]);

  const filteredUsers = useMemo(() => {
    const value = normalizeSearch(query.trim());

    if (!value) return users;

    return users.filter((user) => {
      const searchable = normalizeSearch(
        [user.name, user.email, user.role, user.team, user.status].join(" "),
      );

      return searchable.includes(value);
    });
  }, [query, users]);

  const selectedUsers = useMemo(() => {
    const usersById = new Map(users.map((user) => [user.id, user]));

    return selectedIds
      .map((id) => {
        const user = usersById.get(id);

        if (user) return user;

        const participant = event.participants.find((item) => item.id === id);

        if (!participant) return null;

        return {
          adminRole: "member",
          email: participant.email,
          id: participant.id,
          name: `${participant.firstName} ${participant.lastName}`.trim(),
          presence: "online",
          role: "Participant",
          status: "Ajoute",
          team: "Calendrier",
        } satisfies User;
      })
      .filter((user): user is User => Boolean(user));
  }, [event.participants, selectedIds, users]);

  function toggleParticipant(userId: string) {
    setSelectedIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  }

  function handleClose() {
    if (isSaving) return;
    onClose();
  }

  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    onSave(selectedIds).catch(() => undefined);
  }

  return (
    <AnimatePresence>
      <motion.div
        className="note-modal-overlay"
        role="presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onMouseDown={handleClose}
      >
        <motion.section
          className="note-modal calendar-note-modal calendar-participants-modal"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
        >
          <header>
            <div>
              <h2>Ajouter participant</h2>
              <span>{event.title}</span>
            </div>

            <button
              className="icon-button"
              type="button"
              disabled={isSaving}
              onClick={handleClose}
            >
              <Icon name="x" size={16} />
            </button>
          </header>

          <form className="calendar-event-form" onSubmit={handleSubmit}>
            <div className="calendar-field">
              <span>Participants</span>

              <div className="calendar-participant-search">
                <Icon name="search" size={15} />
                <input
                  value={query}
                  onChange={(inputEvent) => setQuery(inputEvent.target.value)}
                  placeholder="Rechercher un utilisateur"
                  disabled={isSaving}
                />
              </div>

              {selectedUsers.length > 0 ? (
                <div className="calendar-selected-participants">
                  {selectedUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="calendar-selected-participant"
                      disabled={isSaving}
                      onClick={() => toggleParticipant(user.id)}
                    >
                      <Avatar
                        name={user.name}
                        size={24}
                        presence={user.presence}
                      />
                      <span>{user.name}</span>
                      <Icon name="x" size={12} />
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="calendar-participant-list">
                {usersQuery.loading ? (
                  <div className="calendar-participant-empty">
                    Chargement des utilisateurs...
                  </div>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const selected = selectedIds.includes(user.id);

                    return (
                      <button
                        key={user.id}
                        type="button"
                        disabled={isSaving}
                        className={
                          selected
                            ? "calendar-participant selected"
                            : "calendar-participant"
                        }
                        onClick={() => toggleParticipant(user.id)}
                      >
                        <Avatar
                          name={user.name}
                          size={32}
                          presence={user.presence}
                        />

                        <span>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </span>

                        <Icon name={selected ? "check" : "plus"} size={15} />
                      </button>
                    );
                  })
                ) : (
                  <div className="calendar-participant-empty">
                    Aucun utilisateur trouve
                  </div>
                )}
              </div>

              {error ? (
                <p className="calendar-form-error">{error.message}</p>
              ) : null}
            </div>

            <footer className="calendar-event-modal-actions">
              <button
                className="button ghost"
                type="button"
                disabled={isSaving}
                onClick={handleClose}
              >
                Annuler
              </button>

              <button
                className="button primary notes-submit"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </footer>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
}
