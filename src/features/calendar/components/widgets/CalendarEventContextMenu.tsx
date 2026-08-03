import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { CalendarEvent } from "../../../../shared/api/callendar/types";
import { Icon } from "../../../../shared/ui";
import { isManagedCalendarEvent } from "../../utils";

export type CalendarEventContextMenuState = {
  event: CalendarEvent;
  x: number;
  y: number;
};

type CalendarEventContextMenuProps = {
  menu: CalendarEventContextMenuState | null;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete: (event: CalendarEvent) => void;
};

export function CalendarEventContextMenu({
  menu,
  isDeleting = false,
  onClose,
  onDelete,
}: CalendarEventContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    function handleScroll() {
      onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [menu, onClose]);

  const canDelete = menu ? isManagedCalendarEvent(menu.event) : false;

  return (
    <AnimatePresence>
      {menu && canDelete ? (
        <motion.div
          ref={rootRef}
          role="menu"
          aria-label="Actions evenement"
          className="calendar-event-context-menu"
          style={{
            left: Math.min(menu.x, window.innerWidth - 180),
            top: Math.min(menu.y, window.innerHeight - 72),
          }}
          initial={{ opacity: 0, scale: 0.94, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -2 }}
          transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            role="menuitem"
            className="calendar-event-context-item"
            disabled={isDeleting}
            onClick={() => {
              void onDelete(menu.event);
              onClose();
            }}
          >
            <Icon name="trash" size={16} />
            <span>Supprimer</span>
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
