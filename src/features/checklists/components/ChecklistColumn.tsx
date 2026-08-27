import { useMemo, useRef, useState, type PointerEvent, type RefObject } from "react";

import type { Checklist, ChecklistItem, ChecklistMember } from "../../../shared/api/checklists";
import { Avatar, Icon } from "../../../shared/ui";
import { formatDueDate, isOverdue } from "../utils";
import { ChecklistEmptyArt } from "./ChecklistEmptyArt";
import { ChecklistItemMenu } from "./ChecklistItemMenu";

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
  onDeleteTask: (item: ChecklistItem) => void;
  onEditTask: (item: ChecklistItem) => void;
  onItemPointerDown: (item: ChecklistItem, event: PointerEvent<HTMLElement>) => void;
  onOpenMembers: () => void;
  onRename: () => void;
  onSetDeadline: (item: ChecklistItem) => void;
  onToggleItem: (listId: string, itemId: string) => Promise<void>;
  onToggleMenu: () => void;
  onViewTask: (item: ChecklistItem) => void;
  skipClickRef: RefObject<boolean>;
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
  onDeleteTask,
  onEditTask,
  onItemPointerDown,
  onOpenMembers,
  onRename,
  onSetDeadline,
  onToggleItem,
  onToggleMenu,
  onViewTask,
  skipClickRef,
}: ChecklistColumnProps) {
  const isEmpty = checklist.items.length === 0;
  const participants = useMemo(
    () => (checklist.members ?? []).filter((member) => member.role === "EDITOR"),
    [checklist.members],
  );

  return (
    <article
      className={dropIndex !== null ? "cl-column drag-over" : "cl-column"}
      data-cl-column={checklist.id}
    >
      <header className="cl-column-head">
        <h2 className="cl-column-title">{checklist.title}</h2>
        <div className="cl-column-tools">
          {participants.length > 0 ? (
            <ChecklistParticipantAvatars
              onOpen={onOpenMembers}
              participants={participants}
            />
          ) : null}
          {canManage ? (
            <div className="cl-column-menu" ref={menuRef}>
              <button
                className="cl-icon-btn"
                type="button"
                aria-label="Actions de la checklist"
                aria-expanded={menuOpen}
                onClick={onToggleMenu}
              >
                <Icon name="moreV" size={18} strokeWidth={2.2} />
              </button>
              {menuOpen ? (
                <div className="cl-menu">
                  <button type="button" onClick={onRename}>
                    <Icon name="edit" size={16} strokeWidth={2} />
                    Renommer
                  </button>
                  <button type="button" onClick={onOpenMembers}>
                    <Icon name="users" size={16} strokeWidth={2} />
                    Participants
                  </button>
                  <button className="danger" type="button" onClick={onDeleteList}>
                    <Icon name="trash" size={16} strokeWidth={2} />
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
                aria-label="Actions de la checklist"
                disabled
              >
                <Icon name="moreV" size={18} strokeWidth={2.2} />
              </button>
            </div>
          )}
        </div>
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
        Add a list
      </button>

      {isEmpty ? (
        <>
          {dropIndex === 0 ? <div className="cl-drop-line" /> : null}
          <div className="cl-list-body cl-list-body-empty">
            <div className="cl-column-empty">
              <ChecklistEmptyArt />
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
            <div key={item.id} data-cl-item={item.id}>
              {dropIndex === index ? <div className="cl-drop-line" /> : null}
              <ChecklistItemRow
                dragging={draggingItemId === item.id}
                item={item}
                skipClickRef={skipClickRef}
                onDelete={() => onDeleteTask(item)}
                onEdit={() => onEditTask(item)}
                onPointerDown={(event) => onItemPointerDown(item, event)}
                onSetDeadline={() => onSetDeadline(item)}
                onToggle={() => {
                  onToggleItem(checklist.id, item.id).catch(() => undefined);
                }}
                onView={() => onViewTask(item)}
              />
              {item.children.map((child) => (
                <ChecklistItemRow
                  key={child.id}
                  item={child}
                  nested
                  skipClickRef={skipClickRef}
                  onDelete={() => onDeleteTask(child)}
                  onEdit={() => onEditTask(child)}
                  onSetDeadline={() => onSetDeadline(child)}
                  onToggle={() => {
                    onToggleItem(checklist.id, child.id).catch(() => undefined);
                  }}
                  onView={() => onViewTask(child)}
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
  skipClickRef: RefObject<boolean>;
  onDelete?: () => void;
  onEdit?: () => void;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
  onSetDeadline?: () => void;
  onToggle: () => void;
  onView?: () => void;
};

export function ChecklistItemRow({
  dragging = false,
  item,
  nested = false,
  skipClickRef,
  onDelete,
  onEdit,
  onPointerDown,
  onSetDeadline,
  onToggle,
  onView,
}: ItemRowProps) {
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dueLabel = formatDueDate(item.dueDate);
  const overdue = isOverdue(item.dueDate, item.completed);
  const showActions = Boolean(onDelete && onEdit && onSetDeadline) && !dragging;

  return (
    <div
      className={[
        "cl-task",
        nested ? "cl-task-child" : "",
        dragging ? "dragging" : "",
        menuOpen ? "is-menu-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={nested ? undefined : onPointerDown}
      onClick={() => {
        if (skipClickRef.current) {
          skipClickRef.current = false;
          return;
        }
        onView?.();
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
          onSetDeadline ? (
            <button
              className={overdue ? "cl-due overdue" : "cl-due"}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                skipClickRef.current = true;
                onSetDeadline();
              }}
            >
              <Icon name="calendar" size={12} />
              {dueLabel}
            </button>
          ) : (
            <span className={overdue ? "cl-due overdue" : "cl-due"}>
              <Icon name="calendar" size={12} />
              {dueLabel}
            </span>
          )
        ) : null}
      </div>
      {showActions ? (
        <>
          <button
            ref={menuBtnRef}
            className="cl-task-menu-btn"
            type="button"
            aria-label="Actions de la tâche"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
          >
            <Icon name="moreV" size={16} strokeWidth={2.2} />
          </button>
          <ChecklistItemMenu
            open={menuOpen}
            trigger={menuBtnRef.current}
            onClose={() => setMenuOpen(false)}
            onDelete={onDelete!}
            onEdit={onEdit!}
            onSetDeadline={onSetDeadline!}
          />
        </>
      ) : null}
    </div>
  );
}

const MAX_VISIBLE_AVATARS = 3;

function ChecklistParticipantAvatars({
  onOpen,
  participants,
}: {
  onOpen: () => void;
  participants: ChecklistMember[];
}) {
  const visible = participants.slice(0, MAX_VISIBLE_AVATARS);
  const extra = participants.length - visible.length;
  const label = participants
    .map((member) => member.userName ?? "Participant")
    .join(", ");

  return (
    <button
      className="cl-column-avatars"
      type="button"
      aria-label={`Participants : ${label}`}
      title={label}
      onClick={onOpen}
    >
      {visible.map((member, index) => (
        <span
          className="cl-column-avatar"
          key={member.userId}
          style={{ zIndex: visible.length - index }}
        >
          <Avatar name={member.userName} size={22} src={member.avatarUrl} />
        </span>
      ))}
      {extra > 0 ? <span className="cl-column-avatars-extra">+{extra}</span> : null}
    </button>
  );
}
