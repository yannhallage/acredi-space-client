import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import type { ChecklistItem } from "../../shared/api/checklists";
import type { DropTarget } from "./components/ChecklistColumn";

const DRAG_THRESHOLD = 5;

export type ChecklistDragSession = {
  item: ChecklistItem;
  itemId: string;
  sourceListId: string;
  height: number;
  width: number;
  offsetX: number;
  offsetY: number;
};

type PendingPointer = {
  item: ChecklistItem;
  listId: string;
  pointerId: number;
  startX: number;
  startY: number;
  rect: DOMRect;
};

function hitTestDrop(clientX: number, clientY: number): DropTarget | null {
  const columns = document.querySelectorAll<HTMLElement>("[data-cl-column]");
  let match: HTMLElement | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const column of columns) {
    const rect = column.getBoundingClientRect();
    if (clientY < rect.top - 28 || clientY > rect.bottom + 28) continue;
    const dist =
      clientX < rect.left
        ? rect.left - clientX
        : clientX > rect.right
          ? clientX - rect.right
          : 0;
    if (dist > 48 || dist >= bestDist) continue;
    bestDist = dist;
    match = column;
  }

  if (!match) return null;

  const items = [...match.querySelectorAll<HTMLElement>("[data-cl-item]")];
  let index = 0;
  for (const node of items) {
    const rect = node.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) break;
    index += 1;
  }

  return { listId: match.dataset.clColumn ?? "", index };
}

function autoScrollBoard(clientX: number, clientY: number) {
  const board = document.querySelector<HTMLElement>(".cl-board");
  if (!board) return;
  const rect = board.getBoundingClientRect();
  const edge = 56;
  const step = 18;
  if (clientX > rect.right - edge) board.scrollLeft += step;
  else if (clientX < rect.left + edge) board.scrollLeft -= step;
  if (clientY > rect.bottom - edge) board.scrollTop += step;
  else if (clientY < rect.top + edge) board.scrollTop -= step;
}

export function useChecklistPointerDrag(
  onDrop: (sourceListId: string, itemId: string, target: DropTarget) => void,
) {
  const [dragging, setDragging] = useState<ChecklistDragSession | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pendingRef = useRef<PendingPointer | null>(null);
  const draggingRef = useRef<ChecklistDragSession | null>(null);
  const dropTargetRef = useRef<DropTarget | null>(null);
  const onDropRef = useRef(onDrop);
  const skipClickRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  onDropRef.current = onDrop;
  draggingRef.current = dragging;
  dropTargetRef.current = dropTarget;

  const moveOverlay = useCallback((clientX: number, clientY: number) => {
    const session = draggingRef.current;
    const node = overlayRef.current;
    if (!session || !node) return;
    node.style.visibility = "visible";
    node.style.transform = `translate3d(${clientX - session.offsetX}px, ${clientY - session.offsetY}px, 0)`;
  }, []);

  const beginDrag = useCallback((pending: PendingPointer, clientX: number, clientY: number) => {
    const session: ChecklistDragSession = {
      item: pending.item,
      itemId: pending.item.id,
      sourceListId: pending.listId,
      width: pending.rect.width,
      height: pending.rect.height,
      offsetX: clientX - pending.rect.left,
      offsetY: clientY - pending.rect.top,
    };
    skipClickRef.current = true;
    pendingRef.current = null;
    draggingRef.current = session;
    pointerRef.current = { x: clientX, y: clientY };
    setDragging(session);
    setDropTarget(hitTestDrop(clientX, clientY) ?? { listId: pending.listId, index: 0 });
  }, []);

  const stopDrag = useCallback((dropped: boolean) => {
    const session = draggingRef.current;
    const target = dropTargetRef.current;
    pendingRef.current = null;
    draggingRef.current = null;
    dropTargetRef.current = null;
    setDragging(null);
    setDropTarget(null);
    document.body.classList.remove("cl-is-dragging");
    if (dropped && session && target) {
      onDropRef.current(session.sourceListId, session.itemId, target);
    }
  }, []);

  const onItemPointerDown = useCallback(
    (listId: string, item: ChecklistItem, event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, button, a")) return;
      pendingRef.current = {
        item,
        listId,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        rect: event.currentTarget.getBoundingClientRect(),
      };
    },
    [],
  );

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const pending = pendingRef.current;
      if (pending && !draggingRef.current) {
        const dx = event.clientX - pending.startX;
        const dy = event.clientY - pending.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
        event.preventDefault();
        document.body.classList.add("cl-is-dragging");
        beginDrag(pending, event.clientX, event.clientY);
        return;
      }

      const session = draggingRef.current;
      if (!session) return;
      event.preventDefault();
      pointerRef.current = { x: event.clientX, y: event.clientY };
      moveOverlay(event.clientX, event.clientY);
      autoScrollBoard(event.clientX, event.clientY);
      const next = hitTestDrop(event.clientX, event.clientY);
      if (!next) return;
      const current = dropTargetRef.current;
      if (current?.listId === next.listId && current.index === next.index) return;
      dropTargetRef.current = next;
      setDropTarget(next);
    };

    const onUp = (event: PointerEvent) => {
      if (draggingRef.current) {
        event.preventDefault();
        const blockClick = (clickEvent: Event) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
          window.removeEventListener("click", blockClick, true);
        };
        window.addEventListener("click", blockClick, true);
        window.setTimeout(() => {
          window.removeEventListener("click", blockClick, true);
        }, 0);
        stopDrag(true);
        return;
      }
      pendingRef.current = null;
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [beginDrag, moveOverlay, stopDrag]);

  useLayoutEffect(() => {
    if (!dragging) return;
    moveOverlay(pointerRef.current.x, pointerRef.current.y);
  }, [dragging, moveOverlay]);

  return {
    dragging,
    dropTarget,
    overlayRef,
    skipClickRef,
    onItemPointerDown,
  };
}
