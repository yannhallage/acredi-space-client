import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "../../../shared/ui";

export type ChecklistScreen = "board" | "participant";

type ChecklistViewSwitcherProps = {
  canAddList?: boolean;
  participantCount: number;
  value: ChecklistScreen;
  onAddList?: () => void;
  onChange: (screen: ChecklistScreen) => void;
};

export function ChecklistViewSwitcher({
  canAddList = false,
  participantCount,
  value,
  onAddList,
  onChange,
}: ChecklistViewSwitcherProps) {
  const showAddList = Boolean(canAddList && onAddList && value === "board");

  return (
    <div className="cl-bottom-dock">
      <AnimatePresence initial={false}>
        {showAddList ? (
          <motion.button
            className="cl-add-list-btn"
            type="button"
            key="add-list"
            initial={{ opacity: 0, scale: 0.92, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: 8 }}
            transition={{ duration: 0.18 }}
            onClick={onAddList}
          >
            <Icon name="plus" size={16} />
            Add a list
          </motion.button>
        ) : null}
      </AnimatePresence>

      <nav className="cl-view-switcher" aria-label="Vues des checklists">
        <button
          className={value === "board" ? "active" : undefined}
          type="button"
          onClick={() => onChange("board")}
        >
          <Icon name="checklists" size={15} />
          Mes checklists
        </button>
        <button
          className={value === "participant" ? "active" : undefined}
          type="button"
          onClick={() => onChange("participant")}
        >
          <Icon name="users" size={15} />
          Participations
          {participantCount > 0 ? <em>{participantCount}</em> : null}
        </button>
      </nav>
    </div>
  );
}
