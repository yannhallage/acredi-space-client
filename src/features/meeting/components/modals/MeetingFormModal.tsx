import { motion } from "framer-motion";
import type { Feedback } from "../../../../shared/feedback";
import { FeedbackBanner } from "../../../../shared/ui";
import { toDateKey } from "../../../../shared/utils/calendarGrid";
import type { Meeting, MeetingFormState, MeetingMode } from "../../types";

type MeetingFormModalProps = {
  editingMeeting: Meeting | null;
  form: MeetingFormState;
  formError: Feedback | null;
  isSaving: boolean;
  isEnding: boolean;
  onClose: () => void;
  onFormChange: (form: MeetingFormState) => void;
  onSave: () => void;
  onEnd: () => void;
};

export function MeetingFormModal({
  editingMeeting,
  form,
  formError,
  isSaving,
  isEnding,
  onClose,
  onFormChange,
  onSave,
  onEnd,
}: MeetingFormModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-[460px] rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text)] shadow-[var(--shadow)] sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 className="text-[16px] font-semibold">
          {editingMeeting ? "Modifier la réunion" : "Créer une réunion"}
        </h2>

        <div className="mt-5 space-y-3">
          <input
            value={form.title}
            onChange={(e) => onFormChange({ ...form, title: e.target.value })}
            placeholder="Titre"
            className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />

          <input
            type="date"
            min={toDateKey(new Date())}
            value={form.date}
            onChange={(e) => onFormChange({ ...form, date: e.target.value })}
            className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="time"
              value={form.start}
              onChange={(e) => onFormChange({ ...form, start: e.target.value })}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />

            <input
              type="time"
              value={form.end}
              onChange={(e) => onFormChange({ ...form, end: e.target.value })}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(e) =>
              onFormChange({ ...form, description: e.target.value })
            }
            placeholder="Description"
            className="h-[95px] w-full resize-none rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
          />

          <select
            value={form.mode}
            onChange={(e) =>
              onFormChange({ ...form, mode: e.target.value as MeetingMode })
            }
            className="w-full rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text)] outline-none focus:border-[var(--accent)]"
          >
            <option value="Online">Online</option>
            <option value="On-site">On-site</option>
          </select>

          {formError ? <FeedbackBanner feedback={formError} /> : null}
        </div>

        <div className="mt-6 flex flex-wrap justify-between gap-3">
          {editingMeeting ? (
            <button
              onClick={onEnd}
              disabled={isEnding}
              className="rounded-full cursor-pointer border border-[color-mix(in_srgb,var(--red)_30%,var(--border))] px-5 py-2 text-[13px] font-semibold text-[var(--red)] disabled:opacity-60"
              type="button"
            >
              {isEnding ? "Fin en cours..." : "Terminer"}
            </button>
          ) : (
            <div />
          )}

          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="rounded-full cursor-pointer border border-[var(--border)] px-5 py-2 text-[13px] font-semibold hover:bg-[var(--surface-2)]"
              type="button"
            >
              Fermer
            </button>

            <button
              onClick={onSave}
              disabled={isSaving}
              className="rounded-full cursor-pointer bg-[var(--text)] px-5 py-2 text-[13px] font-semibold text-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
            >
              {isSaving
                ? "Enregistrement..."
                : editingMeeting
                  ? "Modifier"
                  : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
