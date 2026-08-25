import type { RefObject } from "react";

import type { Checklist, ChecklistItem } from "../../../shared/api/checklists";
import { ChecklistColumn, type DropTarget } from "./ChecklistColumn";

type ChecklistBoardProps = {
  canCreate?: boolean;
  canManageList: (list: Checklist) => boolean;
  draggingItemId: string | null;
  dropTarget: DropTarget | null;
  label: string;
  lists: Checklist[];
  menuOpenId: string | null;
  menuRef: RefObject<HTMLDivElement | null>;
  onAddList?: () => void;
  onAddTask: (list: Checklist) => void;
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

export function ChecklistBoard({
  canCreate = false,
  canManageList,
  draggingItemId,
  dropTarget,
  label,
  lists,
  menuOpenId,
  menuRef,
  onAddList,
  onAddTask,
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
          onAddTask={() => onAddTask(list)}
          onDeleteList={() => onDeleteList(list)}
          onDragLeaveColumn={() => onDragLeaveColumn(list.id)}
          onDragOverColumn={(index) => onDragOverColumn(list.id, index)}
          onDropColumn={() => onDropColumn(list.id)}
          onEditTask={(item) => onEditTask(list, item)}
          onOpenMembers={() => onOpenMembers(list)}
          onRename={() => onRename(list)}
          onStartDrag={(itemId) => onStartDrag(list.id, itemId)}
          onToggleItem={onToggleItem}
          onToggleMenu={() => onToggleMenu(list.id)}
        />
      ))}

      {canCreate && onAddList ? (
        <button className="cl-add-list-card" type="button" onClick={onAddList}>
          + Add a list
        </button>
      ) : null}
    </section>
  );
}
