import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Team } from "../../types";

export function TeamActionsDropdown({
  isOpen,
  onOpenChange,
  onRequestAddMember,
  onRequestEdit,
  team,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestAddMember: (team: Team) => void;
  onRequestEdit: (team: Team) => void;
  team: Team;
}) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }

      onOpenChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div
      ref={dropdownRef}
      className="team-actions-dropdown"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className="icon-button bordered"
        type="button"
        aria-label={`Options ${team.name}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title="Options"
        onClick={() => onOpenChange(!isOpen)}
      >
        <span className="team-more-vertical">⋮</span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="team-actions-menu"
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="team-actions-item"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onRequestEdit(team);
              }}
            >
              Modifier l'équipe
            </button>

            <button
              type="button"
              className="team-actions-item"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onRequestAddMember(team);
              }}
            >
              Ajouter des membres
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
