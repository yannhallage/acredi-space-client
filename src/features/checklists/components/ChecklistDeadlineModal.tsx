import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { Icon } from "../../../shared/ui";
import { dueDateInputValue } from "../utils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

type ChecklistDeadlineModalProps = {
  dueDate: string | null | undefined;
  isOpen: boolean;
  isSaving: boolean;
  onClear: () => void;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

function toDateKey(date: Date) {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return startOfMonth(new Date());
  return new Date(year, month - 1, day);
}

function buildCalendarDays(viewMonth: Date) {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + index,
    );
    return {
      key: toDateKey(date),
      inMonth: date.getMonth() === month,
    };
  });
}

export function ChecklistDeadlineModal({
  dueDate,
  isOpen,
  isSaving,
  onClear,
  onClose,
  onSubmit,
}: ChecklistDeadlineModalProps) {
  const initialKey = dueDateInputValue(dueDate);
  const [viewMonth, setViewMonth] = useState(() =>
    initialKey ? startOfMonth(parseDateKey(initialKey)) : startOfMonth(new Date()),
  );
  const [selected, setSelected] = useState(initialKey);
  const todayKey = toDateKey(new Date());
  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);
  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  useEffect(() => {
    if (!isOpen) return;
    const nextKey = dueDateInputValue(dueDate);
    setSelected(nextKey);
    setViewMonth(
      nextKey ? startOfMonth(parseDateKey(nextKey)) : startOfMonth(new Date()),
    );
  }, [dueDate, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isSaving, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="cl-modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={() => {
            if (!isSaving) onClose();
          }}
        >
          <motion.div
            className="cl-deadline-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cl-deadline-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="cl-deadline-head">
              <h2 id="cl-deadline-title">
                {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
              </h2>
              <div className="cl-deadline-nav">
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Mois précédent"
                  disabled={isSaving}
                  onClick={() =>
                    setViewMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() - 1, 1),
                    )
                  }
                >
                  <Icon name="chevLeft" size={18} strokeWidth={2} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Mois suivant"
                  disabled={isSaving}
                  onClick={() =>
                    setViewMonth(
                      (current) =>
                        new Date(current.getFullYear(), current.getMonth() + 1, 1),
                    )
                  }
                >
                  <Icon name="chevRight" size={18} strokeWidth={2} />
                </button>
              </div>
            </header>

            <div className="cl-deadline-weekdays" aria-hidden="true">
              {WEEKDAYS.map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>

            <div className="cl-deadline-grid">
              {days.map((day) => {
                const isSelected = selected === day.key;
                const isToday = todayKey === day.key;
                return (
                  <button
                    key={day.key}
                    className={[
                      "cl-deadline-day",
                      day.inMonth ? "" : "is-outside",
                      isToday ? "is-today" : "",
                      isSelected ? "is-selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    type="button"
                    disabled={isSaving}
                    onClick={() => setSelected(day.key)}
                  >
                    {Number(day.key.slice(-2))}
                  </button>
                );
              })}
            </div>

            <footer className="cl-deadline-actions">
              {dueDate ? (
                <button
                  className="button ghost"
                  type="button"
                  disabled={isSaving}
                  onClick={onClear}
                >
                  Retirer
                </button>
              ) : (
                <span />
              )}
              <div className="cl-deadline-actions-end">
                <button
                  className="button ghost"
                  type="button"
                  disabled={isSaving}
                  onClick={onClose}
                >
                  Annuler
                </button>
                <button
                  className="button primary"
                  type="button"
                  disabled={!selected || isSaving}
                  onClick={() => {
                    if (selected) onSubmit(selected);
                  }}
                >
                  {isSaving ? <ClipLoader size={14} color="#ffffff" /> : "OK"}
                </button>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
