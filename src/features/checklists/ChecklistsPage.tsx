import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

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
import { ChecklistBoard } from "./components/ChecklistBoard";
import {
  ChecklistItemRow,
  type DropTarget,
} from "./components/ChecklistColumn";
import { ChecklistEmptyArt } from "./components/ChecklistEmptyArt";
import { ChecklistListModal } from "./components/ChecklistListModal";
import { ChecklistMembersModal } from "./components/ChecklistMembersModal";
import { ChecklistParticipantScreen } from "./components/ChecklistParticipantScreen";
import { ChecklistTaskModal } from "./components/ChecklistTaskModal";
import {
  ChecklistViewSwitcher,
  type ChecklistScreen,
} from "./components/ChecklistViewSwitcher";
import { useChecklistPointerDrag } from "./useChecklistPointerDrag";
import { isChecklistOwner, isChecklistParticipant } from "./utils";
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
  const [screen, setScreen] = useState<ChecklistScreen>("board");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const usersQuery = useUsersQuery({ enabled: Boolean(membersTarget) });
  const lists = useMemo(
    () => checklistsQuery.data ?? [],
    [checklistsQuery.data],
  );
  const membersTargetLive = useMemo(
    () => lists.find((list) => list.id === membersTarget?.id) ?? membersTarget,
    [lists, membersTarget],
  );
  const ownedLists = useMemo(
    () => lists.filter((list) => isChecklistOwner(list, user?.id)),
    [lists, user?.id],
  );
  const participantLists = useMemo(
    () => lists.filter((list) => isChecklistParticipant(list, user?.id)),
    [lists, user?.id],
  );
  const moveItemRef = useRef<
    (sourceListId: string, itemId: string, target: DropTarget) => void
  >(() => undefined);
  const {
    dragging,
    dropTarget,
    overlayRef,
    skipClickRef,
    onItemPointerDown,
  } = useChecklistPointerDrag((sourceListId, itemId, target) => {
    moveItemRef.current(sourceListId, itemId, target);
  });

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
        "Impossible de charger les checklists.",
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
    return isChecklistOwner(list, user?.id);
  }

  async function handleSaveList() {
    if (!listModal) return;
    const title = listModal.title.trim();
    if (!title) {
      showToast("warning", "Le nom de la checklist est obligatoire.");
      return;
    }
    try {
      if (listModal.mode === "rename" && listModal.list) {
        await updateList.mutateAsync({
          id: listModal.list.id,
          request: { title },
        });
        showToast("success", "Checklist renommée.");
      } else {
        await createList.mutateAsync({ title });
        showToast("success", "Checklist créée.");
      }
      setListModal(null);
    } catch (error) {
      showError(error, "Impossible d’enregistrer la checklist.");
    }
  }

  async function handleDeleteList(list: Checklist) {
    setOpenMenuId(null);
    if (!window.confirm(`Supprimer la checklist « ${list.title} » ?`)) return;
    try {
      await deleteList.mutateAsync(list.id);
      showToast("success", "Checklist supprimée.");
    } catch (error) {
      showError(error, "Impossible de supprimer la checklist.");
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
      showToast("success", `${person.name} a été ajouté à la checklist.`);
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
        `${member.userName ?? "Le participant"} a été retiré de la checklist.`,
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
    await handleDeleteItem(
      { id: taskDraft.listId } as Checklist,
      taskDraft.item,
      false,
    );
  }

  async function handleDeleteItem(
    list: Pick<Checklist, "id">,
    item: ChecklistItem,
    confirm = true,
  ) {
    if (confirm && !window.confirm(`Supprimer « ${item.title} » ?`)) return;
    try {
      await deleteItem.mutateAsync({
        id: list.id,
        itemId: item.id,
      });
      if (taskDraft?.item?.id === item.id) {
        setTaskDraft(null);
      }
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

  moveItemRef.current = (sourceListId, itemId, target) => {
    handleMoveItem(sourceListId, itemId, target).catch(() => undefined);
  };

  const isSavingList = createList.isPending || updateList.isPending;
  const isInitialLoading =
    checklistsQuery.isPending ||
    checklistsQuery.isLoading ||
    (checklistsQuery.isFetching && !checklistsQuery.data);
  const participantOpen = screen === "participant";

  const boardShared = {
    canManageList: isOwner,
    draggingItemId: dragging?.itemId ?? null,
    dropTarget,
    menuOpenId: openMenuId,
    menuRef,
    skipClickRef,
    onAddTask: (list: Checklist) =>
      setTaskDraft({
        listId: list.id,
        title: "",
        description: "",
      }),
    onDeleteList: (list: Checklist) => {
      handleDeleteList(list).catch(() => undefined);
    },
    onDeleteTask: (list: Checklist, item: ChecklistItem) => {
      handleDeleteItem(list, item).catch(() => undefined);
    },
    onEditTask: (list: Checklist, item: ChecklistItem) =>
      setTaskDraft({
        listId: list.id,
        item,
        title: item.title,
        description: item.description ?? "",
      }),
    onItemPointerDown: (
      list: Checklist,
      item: ChecklistItem,
      event: PointerEvent<HTMLElement>,
    ) => {
      onItemPointerDown(list.id, item, event);
    },
    onOpenMembers: (list: Checklist) => {
      setOpenMenuId(null);
      setMembersTarget(list);
    },
    onRename: (list: Checklist) => {
      setOpenMenuId(null);
      setListModal({
        mode: "rename",
        list,
        title: list.title,
      });
    },
    onToggleItem: handleToggleItem,
    onToggleMenu: (listId: string) =>
      setOpenMenuId((current) => (current === listId ? null : listId)),
  };

  function changeScreen(next: ChecklistScreen) {
    setOpenMenuId(null);
    setScreen(next);
  }

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
    <div className="cl-page" ref={pageRef}>
      {toast.show ? (
        <Toast intent={toast.intent} message={toast.message} />
      ) : null}

      {dragging && pageRef.current
        ? createPortal(
            <div
              ref={overlayRef}
              className="cl-drag-overlay"
              style={{ width: dragging.width }}
            >
              <ChecklistItemRow
                item={dragging.item}
                skipClickRef={skipClickRef}
                onEdit={() => undefined}
                onToggle={() => undefined}
              />
            </div>,
            pageRef.current,
          )
        : null}

      {checklistsQuery.isError && lists.length === 0 ? (
        <div className="cl-error">
          <Icon name="alert" size={18} />
          <strong>Impossible de charger les checklists</strong>
          <span>{checklistsQuery.error?.message}</span>
        </div>
      ) : (
        <motion.div
          className={participantOpen ? "cl-board-stage is-away" : "cl-board-stage"}
          animate={
            participantOpen
              ? { y: -28, opacity: 0.35, scale: 0.985 }
              : { y: 0, opacity: 1, scale: 1 }
          }
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
        >
          {ownedLists.length === 0 ? (
            <div className="cl-empty">
              <ChecklistEmptyArt />
              <strong>Aucune checklist</strong>
              <span>
                {canCreate
                  ? "Créez votre première checklist pour organiser vos tâches."
                  : "Vous n’avez pas encore de checklist."}
              </span>
            </div>
          ) : (
            <ChecklistBoard
              {...boardShared}
              label="Checklists"
              lists={ownedLists}
            />
          )}
        </motion.div>
      )}

      <ChecklistParticipantScreen
        {...boardShared}
        isOpen={participantOpen}
        lists={participantLists}
        onClose={() => changeScreen("board")}
      />

      <ChecklistViewSwitcher
        canAddList={canCreate}
        participantCount={participantLists.length}
        value={screen}
        onAddList={() => setListModal({ mode: "create", title: "" })}
        onChange={changeScreen}
      />

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
