import { useMemo, useState } from "react";
import { Avatar, Icon } from "../../shared/ui";
import { useUsersQuery } from "../../shared/api/users/hooks";

type CalendarUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  presence?: string;
};

type CreateCalendarEventForm = {
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  participantIds: string[];
};

type CreateCalendarEventModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (event: CreateCalendarEventForm) => void;
};

const initialForm: CreateCalendarEventForm = {
  title: "",
  startsAt: "",
  endsAt: "",
  location: "",
  participantIds: [],
};

export function CreateCalendarEventModal({
  open,
  onClose,
  onCreate,
}: CreateCalendarEventModalProps) {
  const [form, setForm] = useState<CreateCalendarEventForm>(initialForm);
  const [query, setQuery] = useState("");

  const usersQuery = useUsersQuery();
  const users = (usersQuery.data ?? []) as CalendarUser[];

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user: CalendarUser) => {
      const name = user.name?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      const role = user.role?.toLowerCase() ?? "";

      return (
        name.includes(value) ||
        email.includes(value) ||
        role.includes(value)
      );
    });
  }, [query, users]);

  const selectedUsers = useMemo(() => {
    return users.filter((user: CalendarUser) =>
      form.participantIds.includes(user.id)
    );
  }, [users, form.participantIds]);

  if (!open) return null;

  const canSubmit =
    form.title.trim().length >= 2 &&
    Boolean(form.startsAt) &&
    Boolean(form.endsAt) &&
    new Date(form.endsAt) > new Date(form.startsAt);

  function updateField<K extends keyof CreateCalendarEventForm>(
    key: K,
    value: CreateCalendarEventForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleParticipant(userId: string) {
    if (!userId) return;

    setForm((current) => {
      const selected = current.participantIds.includes(userId);

      return {
        ...current,
        participantIds: selected
          ? current.participantIds.filter((id) => id !== userId)
          : [...current.participantIds, userId],
      };
    });
  }

  function handleClose() {
    setForm(initialForm);
    setQuery("");
    onClose();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    onCreate({
      title: form.title.trim(),
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      location: form.location.trim(),
      participantIds: form.participantIds,
    });

    setForm(initialForm);
    setQuery("");
  }

  return (
    <div className="calendar-modal-backdrop" onClick={handleClose}>
      <section
        className="calendar-event-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="calendar-event-modal-header">
          <div>
            <span>Calendrier</span>
            <h2>Créer un événement</h2>
            <p>Planifie une réunion, un rendez-vous ou un rappel d’équipe.</p>
          </div>

          <button className="icon-button" type="button" onClick={handleClose}>
            <Icon name="x" size={18} />
          </button>
        </header>

        <form className="calendar-event-form" onSubmit={handleSubmit}>
          <label className="calendar-field">
            <span>Titre</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Ex: Réunion produit"
              maxLength={180}
              autoFocus
            />
          </label>

          <div className="calendar-form-grid">
            <label className="calendar-field">
              <span>Début</span>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  updateField("startsAt", event.target.value)
                }
              />
            </label>

            <label className="calendar-field">
              <span>Fin</span>
              <input
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) => updateField("endsAt", event.target.value)}
              />
            </label>
          </div>

          <label className="calendar-field">
            <span>Lieu</span>
            <input
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              placeholder="Ex: Salle Direction, Google Meet..."
              maxLength={1024}
            />
          </label>

          <div className="calendar-field">
            <span>Participants</span>

            <div className="calendar-participant-search">
              <Icon name="search" size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un utilisateur"
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="calendar-selected-participants">
                {selectedUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    className="calendar-selected-participant"
                    onClick={() => toggleParticipant(user.id)}
                  >
                    <Avatar name={user.name} size={24} presence={user.presence} />
                    <span>{user.name}</span>
                    <Icon name="x" size={12} />
                  </button>
                ))}
              </div>
            )}

            <div className="calendar-participant-list">
              {usersQuery.loading ? (
                <div className="calendar-participant-empty">
                  Chargement des utilisateurs...
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user: CalendarUser) => {
                  const selected = form.participantIds.includes(user.id);

                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={
                        selected
                          ? "calendar-participant selected"
                          : "calendar-participant"
                      }
                      onClick={() => toggleParticipant(user.id)}
                    >
                      <Avatar name={user.name} size={32} presence={user.presence} />

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
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          </div>

          <footer className="calendar-event-modal-actions">
            <button className="button ghost" type="button" onClick={handleClose}>
              Annuler
            </button>

            <button className="button primary" type="submit" disabled={!canSubmit}>
              <Icon name="plus" size={14} />
              Créer
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}