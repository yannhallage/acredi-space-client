import { useEffect, useMemo, useRef, useState, type DragEvent, type RefObject } from "react";

import Toast from "../../components/app/Toast/Toast";
import {
  useAddChecklistMember,
  useChecklists,
  useCreateChecklist,
  useCreateChecklistItem,
  useDeleteChecklist,
  useDeleteChecklistItem,
  useMoveChecklistItem,
  useRemoveChecklistMember,
  useToggleChecklistItem,
  useUpdateChecklist,
  useUpdateChecklistItem,
  type Checklist,
  type ChecklistItem,
  type ChecklistMember,
} from "../../shared/api/checklists";
import { useUsersQuery } from "../../shared/api/users";
import { useAuth } from "../../shared/context";
import { getFriendlyErrorMessage } from "../../shared/feedback";
import { PERMISSIONS, usePermissions } from "../../shared/permissions";
import type { User } from "../../shared/types";
import { Icon } from "../../shared/ui";
import { ChecklistListModal } from "./components/ChecklistListModal";
import { ChecklistMembersModal } from "./components/ChecklistMembersModal";
import { ChecklistTaskModal } from "./components/ChecklistTaskModal";
import { formatDueDate, isOverdue } from "./utils";
import "./checklists.css";

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

type ListModalState = {
  mode: "create" | "rename";
  list?: Checklist;
  title: string;
};

type TaskDraft = {
  listId: string;
  item?: ChecklistItem;
  title: string;
  description: string;
};

type DragPayload = {
  itemId: string;
  sourceListId: string;
};

type DropTarget = {
  listId: string;
  index: number;
};

const DRAG_MIME = "application/x-acredi-checklist-item";

export function ChecklistsPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(PERMISSIONS.CREATE_CHECKLISTS);
  const checklistsQuery = useChecklists(true);
  const createList = useCreateChecklist();
  const updateList = useUpdateChecklist();
  const deleteList = useDeleteChecklist();
  const addMember = useAddChecklistMember();
  const removeMember = useRemoveChecklistMember();
  const createItem = useCreateChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const moveItem = useMoveChecklistItem();
  const toggleItem = useToggleChecklistItem();
  const deleteItem = useDeleteChecklistItem();

  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [membersTarget, setMembersTarget] = useState<Checklist | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [listModal, setListModal] = useState<ListModalState | null>(null);
  const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const usersQuery = useUsersQuery({ enabled: Boolean(membersTarget) });
  const lists = useMemo(
    () => checklistsQuery.data ?? [],
    [checklistsQuery.data],
  );
  const membersTargetLive = useMemo(
    () => lists.find((list) => list.id === membersTarget?.id) ?? membersTarget,
    [lists, membersTarget],
  );

  useEffect(() => {
    if (!toast.show) return undefined;
    const timer = window.setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [toast.show, toast.message]);

  useEffect(() => {
    if (!checklistsQuery.isError) return;
    setToast({
      show: true,
      intent: "error",
      message: getFriendlyErrorMessage(
        checklistsQuery.error,
        "Impossible de charger les listes.",
      ),
    });
  }, [checklistsQuery.error, checklistsQuery.isError]);

  useEffect(() => {
    if (!membersTarget || !usersQuery.error) return;
    setToast({
      show: true,
      intent: "error",
      message: getFriendlyErrorMessage(
        usersQuery.error,
        "Impossible de charger les utilisateurs.",
      ),
    });
  }, [membersTarget, usersQuery.error]);

  useEffect(() => {
    if (!dragging) return undefined;
    const onEnd = () => {
      setDragging(null);
      setDropTarget(null);
    };
    window.addEventListener("dragend", onEnd);
    return () => window.removeEventListener("dragend", onEnd);
  }, [dragging]);

  useEffect(() => {
    if (!openMenuId) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openMenuId]);

  function showToast(intent: ToastState["intent"], message: string) {
    setToast({ show: true, intent, message });
  }

  function showError(error: unknown, fallback: string) {
    showToast("error", getFriendlyErrorMessage(error, fallback));
  }

  function isOwner(list: Checklist) {
    return list.members.some(
      (member) => member.userId === user?.id && member.role === "OWNER",
    );
  }

  async function handleSaveList() {
    if (!listModal) return;
    const title = listModal.title.trim();
    if (!title) {
      showToast("warning", "Le nom de la liste est obligatoire.");
      return;
    }
    try {
      if (listModal.mode === "rename" && listModal.list) {
        await updateList.mutateAsync({
          id: listModal.list.id,
          request: { title },
        });
        showToast("success", "Liste renommée.");
      } else {
        await createList.mutateAsync({ title });
        showToast("success", "Liste créée.");
      }
      setListModal(null);
    } catch (error) {
      showError(error, "Impossible d’enregistrer la liste.");
    }
  }

  async function handleDeleteList(list: Checklist) {
    setOpenMenuId(null);
    if (!window.confirm(`Supprimer la liste « ${list.title} » ?`)) return;
    try {
      await deleteList.mutateAsync(list.id);
      showToast("success", "Liste supprimée.");
    } catch (error) {
      showError(error, "Impossible de supprimer la liste.");
    }
  }

  async function handleAddMember(person: User) {
    if (!membersTarget) return;
    setPendingUserId(person.id);
    try {
      await addMember.mutateAsync({
        id: membersTarget.id,
        request: { userId: person.id },
      });
      showToast("success", `${person.name} a été ajouté à la liste.`);
    } catch (error) {
      showError(error, "Impossible d’ajouter ce participant.");
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRemoveMember(member: ChecklistMember) {
    if (!membersTarget) return;
    setPendingUserId(member.userId);
    try {
      await removeMember.mutateAsync({
        id: membersTarget.id,
        userId: member.userId,
      });
      showToast(
        "success",
        `${member.userName ?? "Le participant"} a été retiré de la liste.`,
      );
    } catch (error) {
      showError(error, "Impossible de retirer ce participant.");
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleSaveTask() {
    if (!taskDraft) return;
    const title = taskDraft.title.trim();
    if (!title) {
      showToast("warning", "Le titre de la tâche est obligatoire.");
      return;
    }
    try {
      if (taskDraft.item) {
        await updateItem.mutateAsync({
          id: taskDraft.listId,
          itemId: taskDraft.item.id,
          request: {
            title,
            description: taskDraft.description.trim(),
          },
        });
        showToast("success", "Tâche enregistrée.");
      } else {
        await createItem.mutateAsync({
          id: taskDraft.listId,
          request: {
            title,
            description: taskDraft.description.trim() || undefined,
          },
        });
        showToast("success", "Tâche ajoutée.");
      }
      setTaskDraft(null);
    } catch (error) {
      showError(error, "Impossible d’enregistrer la tâche.");
    }
  }

  async function handleDeleteTask() {
    if (!taskDraft?.item) return;
    try {
      await deleteItem.mutateAsync({
        id: taskDraft.listId,
        itemId: taskDraft.item.id,
      });
      setTaskDraft(null);
      showToast("success", "Tâche supprimée.");
    } catch (error) {
      showError(error, "Impossible de supprimer la tâche.");
    }
  }

  async function handleToggleItem(listId: string, itemId: string) {
    try {
      await toggleItem.mutateAsync({ id: listId, itemId });
    } catch (error) {
      showError(error, "Impossible de cocher la tâche.");
    }
  }

  async function handleMoveItem(sourceListId: string, itemId: string, target: DropTarget) {
    const source = lists.find((list) => list.id === sourceListId);
    const fromIndex = source?.items.findIndex((item) => item.id === itemId) ?? -1;
    let position = target.index;
    if (sourceListId === target.listId && fromIndex >= 0 && fromIndex < target.index) {
      position = target.index - 1;
    }
    if (sourceListId === target.listId && position === fromIndex) {
      return;
    }

    try {
      await moveItem.mutateAsync({
        id: sourceListId,
        itemId,
        request: {
          targetChecklistId: target.listId,
          position,
        },
      });
      showToast(
        "success",
        sourceListId === target.listId
          ? "Tâche réordonnée."
          : "Tâche déplacée.",
      );
    } catch (error) {
      showError(error, "Impossible de déplacer la tâche.");
    }
  }

  const isSavingList = createList.isPending || updateList.isPending;
  const isInitialLoading =
    checklistsQuery.isPending ||
    checklistsQuery.isLoading ||
    (checklistsQuery.isFetching && !checklistsQuery.data);

  if (isInitialLoading) {
    return (
      <div className="cl-page cl-skeleton">
        <div className="cl-board">
          {["cl-skel-1", "cl-skel-2", "cl-skel-3"].map((key) => (
            <section className="cl-column" key={key}>
              <div className="cl-skel" style={{ width: "55%", height: 22 }} />
              <div className="cl-skel" style={{ height: 42 }} />
              <div className="cl-skel" style={{ height: 42 }} />
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="cl-page">
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
      ) : null}

      {checklistsQuery.isError && lists.length === 0 ? (
        <div className="cl-error">
          <Icon name="alert" size={18} />
          <strong>Impossible de charger les listes</strong>
          <span>{checklistsQuery.error?.message}</span>
        </div>
      ) : (
        <section className="cl-board" aria-label="Listes">
          {lists.map((list) => (
            <ChecklistColumn
              key={list.id}
              canManage={isOwner(list)}
              checklist={list}
              draggingItemId={dragging?.itemId ?? null}
              dropIndex={dropTarget?.listId === list.id ? dropTarget.index : null}
              menuOpen={openMenuId === list.id}
              menuRef={openMenuId === list.id ? menuRef : undefined}
              onAddTask={() =>
                setTaskDraft({
                  listId: list.id,
                  title: "",
                  description: "",
                })
              }
              onDeleteList={() => {
                handleDeleteList(list).catch(() => undefined);
              }}
              onDragLeaveColumn={() => {
                setDropTarget((current) =>
                  current?.listId === list.id ? null : current,
                );
              }}
              onDragOverColumn={(index) => {
                if (!dragging) return;
                setDropTarget({ listId: list.id, index });
              }}
              onDropColumn={() => {
                if (!dragging || !dropTarget || dropTarget.listId !== list.id) {
                  setDragging(null);
                  setDropTarget(null);
                  return;
                }
                const payload = dragging;
                const target = dropTarget;
                setDragging(null);
                setDropTarget(null);
                handleMoveItem(payload.sourceListId, payload.itemId, target).catch(
                  () => undefined,
                );
              }}
              onEditTask={(item) =>
                setTaskDraft({
                  listId: list.id,
                  item,
                  title: item.title,
                  description: item.description ?? "",
                })
              }
              onOpenMembers={() => {
                setOpenMenuId(null);
                setMembersTarget(list);
              }}
              onRename={() => {
                setOpenMenuId(null);
                setListModal({
                  mode: "rename",
                  list,
                  title: list.title,
                });
              }}
              onStartDrag={(itemId) =>
                setDragging({ itemId, sourceListId: list.id })
              }
              onToggleItem={handleToggleItem}
              onToggleMenu={() =>
                setOpenMenuId((current) => (current === list.id ? null : list.id))
              }
            />
          ))}

          {canCreate ? (
            <button
              className="cl-add-list-card"
              type="button"
              onClick={() => setListModal({ mode: "create", title: "" })}
            >
              + Add a list
            </button>
          ) : null}
        </section>
      )}

      <ChecklistListModal
        isOpen={Boolean(listModal)}
        isSaving={isSavingList}
        mode={listModal?.mode ?? "create"}
        onClose={() => {
          if (isSavingList) return;
          setListModal(null);
        }}
        onSubmit={() => {
          handleSaveList().catch(() => undefined);
        }}
        onTitleChange={(title) =>
          setListModal((current) => (current ? { ...current, title } : current))
        }
        title={listModal?.title ?? ""}
      />

      <ChecklistTaskModal
        description={taskDraft?.description ?? ""}
        isDeleting={deleteItem.isPending}
        isOpen={Boolean(taskDraft)}
        isSaving={createItem.isPending || updateItem.isPending}
        mode={taskDraft?.item ? "edit" : "create"}
        onClose={() => setTaskDraft(null)}
        onDelete={
          taskDraft?.item
            ? () => {
                handleDeleteTask().catch(() => undefined);
              }
            : undefined
        }
        onDescriptionChange={(description) =>
          setTaskDraft((current) =>
            current ? { ...current, description } : current,
          )
        }
        onSubmit={() => {
          handleSaveTask().catch(() => undefined);
        }}
        onTitleChange={(title) =>
          setTaskDraft((current) => (current ? { ...current, title } : current))
        }
        title={taskDraft?.title ?? ""}
      />

      <ChecklistMembersModal
        checklist={membersTargetLive}
        error={usersQuery.error}
        isBusy={addMember.isPending || removeMember.isPending}
        isOpen={Boolean(membersTarget)}
        loading={usersQuery.loading}
        onAdd={(person) => {
          handleAddMember(person).catch(() => undefined);
        }}
        onClose={() => setMembersTarget(null)}
        onRemove={(member) => {
          handleRemoveMember(member).catch(() => undefined);
        }}
        onRetry={usersQuery.refetch}
        pendingUserId={pendingUserId}
        users={usersQuery.data ?? []}
      />
    </div>
  );
}

type ColumnProps = {
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

function ChecklistColumn({
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
}: ColumnProps) {
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
            <button className="cl-icon-btn" type="button" aria-label="Actions de la liste" disabled>
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
          <div className="cl-column-empty">
            <svg className="cl-column-empty-art" viewBox="0 0 180 110" aria-hidden="true">
              <circle cx="142" cy="28" r="16" fill="#fce8c3" />
              <ellipse cx="38" cy="86" rx="22" ry="10" fill="#e8f0fe" />
              <rect x="58" y="58" width="78" height="12" rx="3" fill="#e6e8ea" />
              <rect x="64" y="46" width="66" height="40" rx="4" fill="#f1f3f4" />
              <rect x="74" y="54" width="28" height="18" rx="2" fill="#fff" />
              <circle cx="88" cy="36" r="11" fill="#fbbc04" />
              <path d="M80 36c2 6 14 6 16 0" fill="#f9ab00" />
              <rect x="82" y="46" width="12" height="16" rx="3" fill="#1a73e8" />
              <path d="M74 86h48" stroke="#dadce0" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <strong>No tasks yet</strong>
            <span>Add your to-dos and keep track of them across Google Workspace.</span>
          </div>
        </>
      ) : (
        <div className="cl-tasks">
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
