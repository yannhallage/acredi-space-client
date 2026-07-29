import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../../../../shared/ui";
import { DEFAULT_EVENT_COLOR } from "../../../../shared/api/callendar/normalizers";
import type { ReminderMethod } from "../../../../shared/api/callendar/types";
import { EventColorPicker } from "../widgets/EventColorPicker";

type ReminderDraft = {
  method: ReminderMethod;
  minutesBefore: number;
};

type CreateCalendarEventForm = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  location: string;
  color: string;
  reminders: ReminderDraft[];
};

type CreateCalendarEventModalProps = {
  initialEndsAt?: string;
  initialStartsAt?: string;
  open: boolean;
  onClose: () => void;
  onCreate: (event: CreateCalendarEventForm) => void;
};

const REMINDER_PRESETS: Array<ReminderDraft & { label: string }> = [
  { method: "NOTIFICATION", minutesBefore: 0, label: "Notification · au moment" },
  { method: "NOTIFICATION", minutesBefore: 10, label: "Notification · 10 min" },
  { method: "NOTIFICATION", minutesBefore: 30, label: "Notification · 30 min" },
  { method: "NOTIFICATION", minutesBefore: 60, label: "Notification · 1 h" },
  { method: "EMAIL", minutesBefore: 30, label: "Email · 30 min" },
  { method: "EMAIL", minutesBefore: 1440, label: "Email · 1 jour" },
];

const DEFAULT_REMINDER: ReminderDraft = {
  method: "NOTIFICATION",
  minutesBefore: 30,
};

const initialForm: CreateCalendarEventForm = {
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  allDay: false,
  location: "",
  color: DEFAULT_EVENT_COLOR,
  reminders: [DEFAULT_REMINDER],
};

function reminderKey(reminder: ReminderDraft) {
  return `${reminder.method}:${reminder.minutesBefore}`;
}

function reminderLabel(reminder: ReminderDraft) {
  return (
    REMINDER_PRESETS.find(
      (preset) =>
        preset.method === reminder.method &&
        preset.minutesBefore === reminder.minutesBefore,
    )?.label ??
    `${reminder.method === "EMAIL" ? "Email" : "Notification"} · ${reminder.minutesBefore} min`
  );
}

function summarizeReminders(reminders: ReminderDraft[]) {
  if (reminders.length === 0) return "Aucun rappel";
  if (reminders.length === 1) return reminderLabel(reminders[0]);
  return `${reminders.length} rappels`;
}

export function CreateCalendarEventModal({
  initialEndsAt = "",
  initialStartsAt = "",
  open,
  onClose,
  onCreate,
}: CreateCalendarEventModalProps) {
  const [form, setForm] = useState<CreateCalendarEventForm>(initialForm);
  const [reminderMenuOpen, setReminderMenuOpen] = useState(false);
  const reminderMenuRef = useRef<HTMLDivElement>(null);
  const reminderMenuId = useId();

  useEffect(() => {
    if (!open) return;

    setForm((current) => ({
      ...current,
      startsAt: initialStartsAt,
      endsAt: initialEndsAt,
    }));
  }, [initialEndsAt, initialStartsAt, open]);

  useEffect(() => {
    if (!open) {
      setReminderMenuOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!reminderMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!reminderMenuRef.current?.contains(event.target as Node)) {
        setReminderMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setReminderMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [reminderMenuOpen]);

  const canSubmit =
    form.title.trim().length >= 2 &&
    Boolean(form.startsAt) &&
    Boolean(form.endsAt) &&
    new Date(form.endsAt) > new Date(form.startsAt);

  const selectedKeys = new Set(form.reminders.map(reminderKey));

  function updateField<K extends keyof CreateCalendarEventForm>(
    key: K,
    value: CreateCalendarEventForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleReminder(preset: ReminderDraft) {
    setForm((current) => {
      const key = reminderKey(preset);
      const exists = current.reminders.some((item) => reminderKey(item) === key);

      return {
        ...current,
        reminders: exists
          ? current.reminders.filter((item) => reminderKey(item) !== key)
          : [...current.reminders, preset],
      };
    });
  }

  function handleClose() {
    setForm(initialForm);
    setReminderMenuOpen(false);
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      allDay: form.allDay,
      location: form.location.trim(),
      color: form.color,
      reminders: form.reminders,
    });

    setForm(initialForm);
    setReminderMenuOpen(false);
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
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <header>
              <div>
                <h2>Creer un evenement</h2>
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
                  onChange={(inputEvent) =>
                    updateField("title", inputEvent.target.value)
                  }
                  placeholder="Ex: Reunion produit"
                  maxLength={180}
                  autoFocus
                />
              </label>

              <div className="calendar-form-grid">
                <label className="calendar-field">
                  <span>Debut</span>
                  <input
                    type={form.allDay ? "date" : "datetime-local"}
                    value={
                      form.allDay && form.startsAt
                        ? form.startsAt.slice(0, 10)
                        : form.startsAt
                    }
                    onChange={(inputEvent) => {
                      const value = inputEvent.target.value;
                      updateField(
                        "startsAt",
                        form.allDay ? `${value}T00:00` : value,
                      );
                    }}
                  />
                </label>

                <label className="calendar-field">
                  <span>Fin</span>
                  <input
                    type={form.allDay ? "date" : "datetime-local"}
                    value={
                      form.allDay && form.endsAt
                        ? form.endsAt.slice(0, 10)
                        : form.endsAt
                    }
                    onChange={(inputEvent) => {
                      const value = inputEvent.target.value;
                      updateField(
                        "endsAt",
                        form.allDay ? `${value}T23:59` : value,
                      );
                    }}
                  />
                </label>
              </div>

              <label className="calendar-field calendar-checkbox-field">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(inputEvent) =>
                    updateField("allDay", inputEvent.target.checked)
                  }
                />
                <span>Journee entiere</span>
              </label>

              <label className="calendar-field">
                <span>Lieu</span>
                <input
                  value={form.location}
                  onChange={(inputEvent) =>
                    updateField("location", inputEvent.target.value)
                  }
                  placeholder="Salle, lien ou adresse"
                  maxLength={1024}
                />
              </label>

              <label className="calendar-field">
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(inputEvent) =>
                    updateField("description", inputEvent.target.value)
                  }
                  placeholder="Ajouter une description"
                  rows={3}
                  maxLength={10000}
                />
              </label>

              <div className="calendar-meta-row">
                <EventColorPicker
                  value={form.color}
                  onChange={(color) => updateField("color", color)}
                />

                <div className="calendar-field calendar-reminder-field" ref={reminderMenuRef}>
                  <span>Rappel</span>
                  <button
                    type="button"
                    className="calendar-meta-trigger"
                    aria-haspopup="menu"
                    aria-expanded={reminderMenuOpen}
                    aria-controls={reminderMenuId}
                    onClick={() => setReminderMenuOpen((current) => !current)}
                  >
                    <Icon name="bell" size={15} />
                    <span className="calendar-meta-trigger-label">
                      {summarizeReminders(form.reminders)}
                    </span>
                    <Icon name="chevDown" size={14} />
                  </button>

                  <AnimatePresence>
                    {reminderMenuOpen ? (
                      <motion.div
                        id={reminderMenuId}
                        role="menu"
                        className="calendar-reminder-menu"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.14 }}
                      >
                        {REMINDER_PRESETS.map((preset) => {
                          const selected = selectedKeys.has(reminderKey(preset));

                          return (
                            <button
                              key={reminderKey(preset)}
                              type="button"
                              role="menuitemcheckbox"
                              aria-checked={selected}
                              className={
                                selected
                                  ? "calendar-reminder-option selected"
                                  : "calendar-reminder-option"
                              }
                              onClick={() => toggleReminder(preset)}
                            >
                              <span>{preset.label}</span>
                              {selected ? <Icon name="check" size={14} /> : null}
                            </button>
                          );
                        })}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
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
                  Creer
                </button>
              </footer>
            </form>
          </section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
