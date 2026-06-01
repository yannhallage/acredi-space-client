import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../../shared/ui";

type CreateCalendarEventForm = {
  title: string;
  startsAt: string;
  endsAt: string;
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
};

export function CreateCalendarEventModal({
  open,
  onClose,
  onCreate,
}: CreateCalendarEventModalProps) {
  const [form, setForm] = useState<CreateCalendarEventForm>(initialForm);

  const canSubmit =
    form.title.trim().length >= 2 &&
    Boolean(form.startsAt) &&
    Boolean(form.endsAt) &&
    new Date(form.endsAt) > new Date(form.startsAt);

  function updateField<K extends keyof CreateCalendarEventForm>(
    key: K,
    value: CreateCalendarEventForm[K],
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
      title: form.title.trim(),
      startsAt: form.startsAt,
      endsAt: form.endsAt,
    });

    setForm(initialForm);
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="note-modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={handleClose}
        >
          <section
            className="note-modal calendar-note-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <h2>Créer un événement</h2>
                <span>Calendrier</span>
              </div>

              <button
                className="icon-button"
                type="button"
                onClick={handleClose}
              >
                <Icon name="x" size={16} />
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
                    onChange={(event) =>
                      updateField("endsAt", event.target.value)
                    }
                  />
                </label>
              </div>

              <footer className="calendar-event-modal-actions">
                <button
                  className="button ghost"
                  type="button"
                  onClick={handleClose}
                >
                  Annuler
                </button>

                <button
                  className="button primary notes-submit"
                  type="submit"
                  disabled={!canSubmit}
                >
                  <Icon name="plus" size={14} />
                  Créer
                </button>
              </footer>
            </form>
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}