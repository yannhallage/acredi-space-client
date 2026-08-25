import type { PointerEvent, RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Checklist, ChecklistItem } from "../../../shared/api/checklists";
import { Icon } from "../../../shared/ui";
import { ChecklistBoard } from "./ChecklistBoard";
import type { DropTarget } from "./ChecklistColumn";
import { ChecklistEmptyArt } from "./ChecklistEmptyArt";

type ChecklistParticipantScreenProps = {
  canManageList: (list: Checklist) => boolean;
  draggingItemId: string | null;
  dropTarget: DropTarget | null;
  isOpen: boolean;
  lists: Checklist[];
  menuOpenId: string | null;
  menuRef: RefObject<HTMLDivElement | null>;
  skipClickRef: RefObject<boolean>;
  onAddTask: (list: Checklist) => void;
  onClose: () => void;
  onDeleteList: (list: Checklist) => void;
  onEditTask: (list: Checklist, item: ChecklistItem) => void;
  onItemPointerDown: (
    list: Checklist,
    item: ChecklistItem,
    event: PointerEvent<HTMLElement>,
  ) => void;
  onOpenMembers: (list: Checklist) => void;
  onRename: (list: Checklist) => void;
  onToggleItem: (listId: string, itemId: string) => Promise<void>;
  onToggleMenu: (listId: string) => void;
};

const slide = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
  transition: { type: "spring" as const, damping: 28, stiffness: 320, mass: 0.9 },
};

export function ChecklistParticipantScreen({
  canManageList,
  draggingItemId,
  dropTarget,
  isOpen,
  lists,
  menuOpenId,
  menuRef,
  skipClickRef,
  onAddTask,
  onClose,
  onDeleteList,
  onEditTask,
  onItemPointerDown,
  onOpenMembers,
  onRename,
  onToggleItem,
  onToggleMenu,
}: ChecklistParticipantScreenProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.section
          className="cl-participant-screen"
          aria-label="Checklists participantes"
          initial={slide.initial}
          animate={slide.animate}
          exit={slide.exit}
          transition={slide.transition}
        >
          <header className="cl-participant-head">
            <div>
              <h2>Checklists participantes</h2>
              <p>Uniquement les checklists auxquelles vous avez été ajouté.</p>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Fermer les checklists participantes"
              onClick={onClose}
            >
              <Icon name="x" size={16} />
            </button>
          </header>

          {lists.length === 0 ? (
            <div className="cl-participant-empty">
              <ChecklistEmptyArt />
              <strong>Aucune checklist partagée</strong>
              <span>
                Les checklists où quelqu’un vous ajoute comme participant
                apparaîtront ici.
              </span>
            </div>
          ) : (
            <ChecklistBoard
              canManageList={canManageList}
              draggingItemId={draggingItemId}
              dropTarget={dropTarget}
              label="Checklists participantes"
              lists={lists}
              menuOpenId={menuOpenId}
              menuRef={menuRef}
              skipClickRef={skipClickRef}
              onAddTask={onAddTask}
              onDeleteList={onDeleteList}
              onEditTask={onEditTask}
              onItemPointerDown={onItemPointerDown}
              onOpenMembers={onOpenMembers}
              onRename={onRename}
              onToggleItem={onToggleItem}
              onToggleMenu={onToggleMenu}
            />
          )}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
