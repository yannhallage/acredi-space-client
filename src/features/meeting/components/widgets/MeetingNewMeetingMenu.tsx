import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "../../../../shared/ui";

type MeetingNewMeetingMenuProps = {
  open: boolean;
  onClose: () => void;
  onCreateForLater: () => void;
  onStartInstant: () => void;
  onSchedule: () => void;
  isStartingInstant: boolean;
};

const ITEMS = [
  {
    key: "later",
    icon: "share" as const,
    label: "Créer pour plus tard",
    hint: "Lien prêt à partager",
  },
  {
    key: "instant",
    icon: "video" as const,
    label: "Démarrer maintenant",
    hint: "Réunion instantanée",
  },
  {
    key: "schedule",
    icon: "calendar" as const,
    label: "Planifier",
    hint: "Dans le calendrier",
  },
] as const;

export function MeetingNewMeetingMenu({
  open,
  onClose,
  onCreateForLater,
  onStartInstant,
  onSchedule,
  isStartingInstant,
}: MeetingNewMeetingMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const handlers = {
    later: onCreateForLater,
    instant: onStartInstant,
    schedule: onSchedule,
  } as const;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={menuRef}
          role="menu"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="absolute left-0 top-[calc(100%+10px)] z-30 w-[280px] overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--surface)] py-1.5 shadow-[var(--shadow)]"
        >
          {ITEMS.map((item) => {
            const disabled = item.key === "instant" && isStartingInstant;
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={handlers[item.key]}
                className="flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition hover:bg-[var(--surface-2)] disabled:opacity-55"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--surface-2)] text-[var(--text)]">
                  <Icon name={item.icon} size={16} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-[var(--text)]">
                    {item.key === "instant" && isStartingInstant
                      ? "Démarrage..."
                      : item.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[var(--muted)]">
                    {item.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
