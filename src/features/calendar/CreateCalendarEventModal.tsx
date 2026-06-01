import { useState, type FormEvent } from "react";
import { Icon } from "../../shared/ui";

type CreateCalendarEventForm = {
  endsAt: string;
  startsAt: string;
  title: string;
};

type CreateCalendarEventModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (event: CreateCalendarEventForm) => void;
};

const initialForm: CreateCalendarEventForm = {
  endsAt: "",
  startsAt: "",
  title: "",
};

export function CreateCalendarEventModal({
  open,
  onClose,
  onCreate,
}: CreateCalendarEventModalProps) {
  const [form, setForm] = useState<CreateCalendarEventForm>(initialForm);

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

  function handleClose() {
    setForm(initialForm);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    onCreate({
      endsAt: form.endsAt,
      startsAt: form.startsAt,
      title: form.title.trim(),
    });

    setForm(initialForm);
  }

  return (
    <div className="note-modal-overlay" onClick={handleClose}>
      <section
        className="note-modal calendar-note-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <h2>Creer un evenement</h2>
            <span>Calendrier</span>
          </div>

          <button className="icon-button" type="button" onClick={handleClose}>
            <Icon name="x" size={16} />
          </button>
        </header>

        <form className="calendar-event-form" onSubmit={handleSubmit}>
          <label className="calendar-field">
            <span>Titre</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Ex: Reunion produit"
              maxLength={180}
              autoFocus
            />
          </label>

          <div className="calendar-form-grid">
            <label className="calendar-field">
              <span>Debut</span>
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

          <footer className="calendar-event-modal-actions">
            <button className="button ghost" type="button" onClick={handleClose}>
              Annuler
            </button>

            <button className="button primary notes-submit" type="submit" disabled={!canSubmit}>
              <Icon name="plus" size={14} />
              Creer
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
