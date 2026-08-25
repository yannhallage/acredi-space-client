import type { Checklist, ChecklistItem } from "./types";

function cloneItem(item: ChecklistItem): ChecklistItem {
  return { ...item, children: item.children.map(cloneItem) };
}

function cloneChecklist(list: Checklist): Checklist {
  return {
    ...list,
    members: list.members.map((member) => ({ ...member })),
    items: list.items.map(cloneItem),
  };
}

function reindex(items: ChecklistItem[]): ChecklistItem[] {
  return items.map((item, index) => ({ ...item, position: index }));
}

export function moveItemOnBoard(
  lists: Checklist[],
  sourceListId: string,
  itemId: string,
  targetListId: string,
  position: number,
): Checklist[] {
  const next = lists.map(cloneChecklist);
  const source = next.find((list) => list.id === sourceListId);
  const target = next.find((list) => list.id === targetListId);
  if (!source || !target) {
    return lists;
  }

  const fromIndex = source.items.findIndex((item) => item.id === itemId);
  if (fromIndex < 0) {
    return lists;
  }

  const [item] = source.items.splice(fromIndex, 1);
  item.checklistId = targetListId;
  const insertAt = Math.max(0, Math.min(position, target.items.length));
  target.items.splice(insertAt, 0, item);

  source.items = reindex(source.items);
  if (sourceListId !== targetListId) {
    target.items = reindex(target.items);
  }

  return next;
}

function toggleCompleted(item: ChecklistItem): ChecklistItem {
  const completed = !item.completed;
  return {
    ...item,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
  };
}

export function toggleItemOnBoard(
  lists: Checklist[],
  listId: string,
  itemId: string,
): Checklist[] {
  return lists.map((list) => {
    if (list.id !== listId) {
      return list;
    }

    return {
      ...list,
      items: list.items.map((item) => {
        if (item.id === itemId) {
          return toggleCompleted(item);
        }
        return {
          ...item,
          children: item.children.map((child) =>
            child.id === itemId ? toggleCompleted(child) : child,
          ),
        };
      }),
    };
  });
}
