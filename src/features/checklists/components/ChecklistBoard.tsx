import type { PointerEvent, RefObject } from "react";

import type { Checklist, ChecklistItem } from "../../../shared/api/checklists";
import { ChecklistColumn, type DropTarget } from "./ChecklistColumn";

type ChecklistBoardProps = {
  canManageList: (list: Checklist) => boolean;
  draggingItemId: string | null;
  dropTarget: DropTarget | null;
  label: string;
  lists: Checklist[];
  menuOpenId: string | null;
  menuRef: RefObject<HTMLDivElement | null>;
  skipClickRef: RefObject<boolean>;
  onAddTask: (list: Checklist) => void;
  onDeleteList: (list: Checklist) => void;
  onDeleteTask: (list: Checklist, item: ChecklistItem) => void;
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

export function ChecklistBoard({
  canManageList,
  draggingItemId,
  dropTarget,
  label,
  lists,
  menuOpenId,
  menuRef,
  skipClickRef,
  onAddTask,
  onDeleteList,
  onDeleteTask,
  onEditTask,
  onItemPointerDown,
  onOpenMembers,
  onRename,
  onToggleItem,
  onToggleMenu,
}: ChecklistBoardProps) {
  return (
    <section className="cl-board" aria-label={label}>
      {lists.map((list) => (
        <ChecklistColumn
          key={list.id}
          canManage={canManageList(list)}
          checklist={list}
          draggingItemId={draggingItemId}
          dropIndex={dropTarget?.listId === list.id ? dropTarget.index : null}
          menuOpen={menuOpenId === list.id}
          menuRef={menuOpenId === list.id ? menuRef : undefined}
          skipClickRef={skipClickRef}
          onAddTask={() => onAddTask(list)}
          onDeleteList={() => onDeleteList(list)}
          onDeleteTask={(item) => onDeleteTask(list, item)}
          onEditTask={(item) => onEditTask(list, item)}
          onItemPointerDown={(item, event) => onItemPointerDown(list, item, event)}
          onOpenMembers={() => onOpenMembers(list)}
          onRename={() => onRename(list)}
          onToggleItem={onToggleItem}
          onToggleMenu={() => onToggleMenu(list.id)}
        />
      ))}
    </section>
  );
}
