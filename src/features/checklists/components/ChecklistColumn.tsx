import { useRef, type DragEvent, type RefObject } from "react";

import type { Checklist, ChecklistItem } from "../../../shared/api/checklists";
import { Icon } from "../../../shared/ui";
import { formatDueDate, isOverdue } from "../utils";

export const DRAG_MIME = "application/x-acredi-checklist-item";

export type DropTarget = {
  listId: string;
  index: number;
};

type ChecklistColumnProps = {
  canManage: boolean;
  checklist: Checklist;
  draggingItemId: string | null;
  dropIndex: number | null;
  menuOpen: boolean;
  menuRef?: RefObject<HTMLDivElement | null>;
  onAddTask: () => void;
  onDeleteList: () => void;
  onDragLeaveColumn: () => void;
  onDragOverColumn: (index: number) => void;
  onDropColumn: () => void;
  onEditTask: (item: ChecklistItem) => void;
  onOpenMembers: () => void;
  onRename: () => void;
  onStartDrag: (itemId: string) => void;
  onToggleItem: (listId: string, itemId: string) => Promise<void>;
  onToggleMenu: () => void;
};

export function ChecklistColumn({
  canManage,
  checklist,
  draggingItemId,
  dropIndex,
  menuOpen,
  menuRef,
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
}: ChecklistColumnProps) {
  function handleDragOver(event: DragEvent<HTMLElement>, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    onDragOverColumn(index);
  }

  const isEmpty = checklist.items.length === 0;

  return (
    <article
      className={dropIndex !== null ? "cl-column drag-over" : "cl-column"}
      onDragOver={(event) => handleDragOver(event, checklist.items.length)}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          onDragLeaveColumn();
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropColumn();
      }}
    >
      <header className="cl-column-head">
        <h2 className="cl-column-title">{checklist.title}</h2>
        {canManage ? (
          <div className="cl-column-menu" ref={menuRef}>
            <button
              className="cl-icon-btn"
              type="button"
              aria-label="Actions de la liste"
              aria-expanded={menuOpen}
              onClick={onToggleMenu}
            >
              <Icon name="moreV" size={16} />
            </button>
            {menuOpen ? (
              <div className="cl-menu">
                <button type="button" onClick={onRename}>
                  Renommer
                </button>
                <button type="button" onClick={onOpenMembers}>
                  Participants
                </button>
                <button className="danger" type="button" onClick={onDeleteList}>
                  Supprimer
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="cl-column-menu">
            <button
              className="cl-icon-btn"
              type="button"
              aria-label="Actions de la liste"
              disabled
            >
              <Icon name="moreV" size={16} />
            </button>
          </div>
        )}
      </header>

      <button className="cl-add-task" type="button" onClick={onAddTask}>
        <span className="cl-add-task-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="currentColor"
              d="M22 13h-2v3h-3v2h3v3h2v-3h3v-2h-3zm-2-7c0-1.1-.9-2-2-2h-1c0-1.66-1.34-3-3-3s-3 1.34-3 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-2H6V6h2v3h8V6h2v7h2V6zm-7-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S15.33 5 14.5 5 13 4.33 13 3.5zM8 13h4v-2H8zm0 3h4v-2H8z"
            />
          </svg>
        </span>
        Add a task
      </button>

      {isEmpty ? (
        <>
          {dropIndex === 0 ? <div className="cl-drop-line" /> : null}
          <div className="cl-list-body cl-list-body-empty">
            <div className="cl-column-empty">
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
              <strong>No tasks yet</strong>
              <span>
                Add your to-dos and keep track of them across Google Workspace.
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="cl-list-body cl-tasks">
          {checklist.items.map((item, index) => (
            <div key={item.id}>
              {dropIndex === index ? <div className="cl-drop-line" /> : null}
              <ChecklistItemRow
                dragging={draggingItemId === item.id}
                item={item}
                onDragOverRow={(event) => {
                  event.stopPropagation();
                  handleDragOver(event, index);
                }}
                onEdit={() => onEditTask(item)}
                onStartDrag={() => onStartDrag(item.id)}
                onToggle={() => {
                  onToggleItem(checklist.id, item.id).catch(() => undefined);
                }}
              />
              {item.children.map((child) => (
                <ChecklistItemRow
                  key={child.id}
                  item={child}
                  nested
                  onEdit={() => onEditTask(child)}
                  onToggle={() => {
                    onToggleItem(checklist.id, child.id).catch(() => undefined);
                  }}
                />
              ))}
            </div>
          ))}
          {dropIndex === checklist.items.length ? <div className="cl-drop-line" /> : null}
        </div>
      )}
    </article>
  );
}

type ItemRowProps = {
  dragging?: boolean;
  item: ChecklistItem;
  nested?: boolean;
  onDragOverRow?: (event: DragEvent<HTMLElement>) => void;
  onEdit: () => void;
  onStartDrag?: () => void;
  onToggle: () => void;
};

function ChecklistItemRow({
  dragging = false,
  item,
  nested = false,
  onDragOverRow,
  onEdit,
  onStartDrag,
  onToggle,
}: ItemRowProps) {
  const skipClickRef = useRef(false);
  const dueLabel = formatDueDate(item.dueDate);
  const overdue = isOverdue(item.dueDate, item.completed);

  return (
    <div
      className={[
        "cl-task",
        nested ? "cl-task-child" : "",
        dragging ? "dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      draggable={!nested}
      onDragStart={(event) => {
        if (nested || !onStartDrag) return;
        skipClickRef.current = true;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(DRAG_MIME, item.id);
        onStartDrag();
      }}
      onDragOver={onDragOverRow}
      onClick={() => {
        if (skipClickRef.current) {
          skipClickRef.current = false;
          return;
        }
        onEdit();
      }}
    >
      <input
        className="cl-check"
        type="checkbox"
        checked={item.completed}
        onChange={onToggle}
        onClick={(event) => event.stopPropagation()}
        aria-label={item.completed ? "Marquer comme à faire" : "Marquer comme terminée"}
      />
      <div className="cl-task-body">
        <p className={item.completed ? "cl-task-title done" : "cl-task-title"}>
          {item.title}
        </p>
        {item.description ? (
          <p className={item.completed ? "cl-task-desc done" : "cl-task-desc"}>
            {item.description}
          </p>
        ) : null}
        {dueLabel ? (
          <span className={overdue ? "cl-due overdue" : "cl-due"}>
            <Icon name="calendar" size={12} />
            {dueLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
