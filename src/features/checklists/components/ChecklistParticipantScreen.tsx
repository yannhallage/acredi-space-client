import type { RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Checklist, ChecklistItem } from "../../../shared/api/checklists";
import { Icon } from "../../../shared/ui";
import { ChecklistBoard } from "./ChecklistBoard";
import type { DropTarget } from "./ChecklistColumn";

type ChecklistParticipantScreenProps = {
  canManageList: (list: Checklist) => boolean;
  draggingItemId: string | null;
  dropTarget: DropTarget | null;
  isOpen: boolean;
  lists: Checklist[];
  menuOpenId: string | null;
  menuRef: RefObject<HTMLDivElement | null>;
  onAddTask: (list: Checklist) => void;
  onClose: () => void;
  onDeleteList: (list: Checklist) => void;
  onDragLeaveColumn: (listId: string) => void;
  onDragOverColumn: (listId: string, index: number) => void;
  onDropColumn: (listId: string) => void;
  onEditTask: (list: Checklist, item: ChecklistItem) => void;
  onOpenMembers: (list: Checklist) => void;
  onRename: (list: Checklist) => void;
  onStartDrag: (listId: string, itemId: string) => void;
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
  onAddTask,
  onClose,
  onDeleteList,
  onDragLeaveColumn,
  onDragOverColumn,
  onDropColumn,
  onEditTask,
  onOpenMembers,
  onRename,
  onStartDrag,
  onToggleItem,
  onToggleMenu,
}: ChecklistParticipantScreenProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.section
          className="cl-participant-screen"
          aria-label="Listes participantes"
          initial={slide.initial}
          animate={slide.animate}
          exit={slide.exit}
          transition={slide.transition}
        >
          <header className="cl-participant-head">
            <div>
              <h2>Listes participantes</h2>
              <p>Uniquement les listes auxquelles vous avez été ajouté.</p>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Fermer les listes participantes"
              onClick={onClose}
            >
              <Icon name="x" size={16} />
            </button>
          </header>

          {lists.length === 0 ? (
            <div className="cl-participant-empty">
              <img
                className="cl-column-empty-art cl-column-empty-art-light"
                src="https://www.gstatic.com/tasks/empty-tasks-light.svg"
                alt=""
                draggable={false}
                onError={(event) => {
                  event.currentTarget.src = "/checklists/empty-tasks-light.svg";
                }}
              />
              <img
                className="cl-column-empty-art cl-column-empty-art-dark"
                src="https://www.gstatic.com/tasks/empty-tasks-dark.svg"
                alt=""
                draggable={false}
                onError={(event) => {
                  event.currentTarget.src = "/checklists/empty-tasks-dark.svg";
                }}
              />
              <strong>Aucune liste partagée</strong>
              <span>
                Les listes où quelqu’un vous ajoute comme participant
                apparaîtront ici.
              </span>
            </div>
          ) : (
            <ChecklistBoard
              canManageList={canManageList}
              draggingItemId={draggingItemId}
              dropTarget={dropTarget}
              label="Listes participantes"
              lists={lists}
              menuOpenId={menuOpenId}
              menuRef={menuRef}
              onAddTask={onAddTask}
              onDeleteList={onDeleteList}
              onDragLeaveColumn={onDragLeaveColumn}
              onDragOverColumn={onDragOverColumn}
              onDropColumn={onDropColumn}
              onEditTask={onEditTask}
              onOpenMembers={onOpenMembers}
              onRename={onRename}
              onStartDrag={onStartDrag}
              onToggleItem={onToggleItem}
              onToggleMenu={onToggleMenu}
            />
          )}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
