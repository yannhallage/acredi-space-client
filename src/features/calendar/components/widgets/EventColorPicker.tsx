import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../../../../shared/ui";
import {
  DEFAULT_EVENT_COLOR,
  EVENT_COLORS,
} from "../../../../shared/api/callendar/normalizers";

type EventColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

export function EventColorPicker({ value, onChange }: EventColorPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = value || DEFAULT_EVENT_COLOR;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="calendar-field calendar-color-picker" ref={rootRef}>
      <span>Couleur</span>

      <button
        type="button"
        className="calendar-meta-trigger calendar-color-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Choisir une couleur"
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className="calendar-color-swatch"
          style={{ backgroundColor: selected }}
        />
        <Icon name="chevDown" size={14} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={listId}
            role="listbox"
            aria-label="Couleurs d'evenement"
            className="calendar-color-dropdown"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.14 }}
          >
            <div className="calendar-color-grid">
              {EVENT_COLORS.map((color) => {
                const isSelected =
                  color.toUpperCase() === selected.toUpperCase();

                return (
                  <button
                    key={color}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={
                      isSelected
                        ? "calendar-color-option selected"
                        : "calendar-color-option"
                    }
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChange(color);
                      setOpen(false);
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
