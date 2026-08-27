import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Icon } from "../../../shared/ui";

export type ChecklistScreen = "board" | "participant";

type ChecklistViewSwitcherProps = {
  canAddList?: boolean;
  listCount: number;
  participantCount: number;
  value: ChecklistScreen;
  onAddList?: () => void;
  onChange: (screen: ChecklistScreen) => void;
};

function getActiveBoard(screen: ChecklistScreen) {
  if (screen === "participant") {
    return document.querySelector<HTMLElement>(
      ".cl-participant-screen .cl-board",
    );
  }
  return document.querySelector<HTMLElement>(".cl-board-stage .cl-board");
}

function getScrollState(board: HTMLElement | null) {
  if (!board) {
    return { canBack: false, canForward: false };
  }
  const max = board.scrollWidth - board.clientWidth;
  return {
    canBack: board.scrollLeft > 4,
    canForward: max > 4 && board.scrollLeft < max - 4,
  };
}

export function ChecklistViewSwitcher({
  canAddList = false,
  listCount,
  participantCount,
  value,
  onAddList,
  onChange,
}: ChecklistViewSwitcherProps) {
  const showAddList = Boolean(canAddList && onAddList && value === "board");
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let board: HTMLElement | null = null;
    let observer: ResizeObserver | null = null;
    let retry: number | undefined;
    let attempts = 0;

    const sync = () => {
      if (cancelled) return;
      const next = getScrollState(getActiveBoard(value));
      setCanBack(next.canBack);
      setCanForward(next.canForward);
    };

    const bind = () => {
      if (cancelled) return;
      board = getActiveBoard(value);
      if (!board && attempts < 20) {
        attempts += 1;
        retry = window.setTimeout(bind, 50);
        return;
      }
      if (!board) {
        sync();
        return;
      }
      sync();
      board.addEventListener("scroll", sync, { passive: true });
      observer = new ResizeObserver(sync);
      observer.observe(board);
    };

    bind();
    window.addEventListener("resize", sync);

    return () => {
      cancelled = true;
      if (retry) window.clearTimeout(retry);
      board?.removeEventListener("scroll", sync);
      observer?.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [listCount, value]);

  function scrollBoard(direction: -1 | 1) {
    const board = getActiveBoard(value);
    if (!board) return;
    const column = board.querySelector<HTMLElement>(".cl-column");
    const step = (column?.getBoundingClientRect().width ?? 300) + 16;
    board.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="cl-bottom-dock">
      <AnimatePresence initial={false}>
        {showAddList ? (
          <motion.button
            className="cl-add-list-btn"
            type="button"
            key="add-list"
            initial={{ opacity: 0, scale: 0.92, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.92, x: 8 }}
            transition={{ duration: 0.18 }}
            onClick={onAddList}
          >
            <Icon name="plus" size={16} />
            Add a list
          </motion.button>
        ) : null}
      </AnimatePresence>

      <nav className="cl-view-switcher" aria-label="Vues des checklists">
        <button
          className={value === "board" ? "active" : undefined}
          type="button"
          onClick={() => onChange("board")}
        >
          <Icon name="checklists" size={15} />
          Mes checklists
        </button>
        <button
          className={value === "participant" ? "active" : undefined}
          type="button"
          onClick={() => onChange("participant")}
        >
          <Icon name="users" size={15} />
          Participations
          {participantCount > 0 ? <em>{participantCount}</em> : null}
        </button>
      </nav>

      <div className="cl-board-nav" role="group" aria-label="Faire défiler les checklists">
        <button
          type="button"
          aria-label="Checklists précédentes"
          disabled={!canBack}
          onClick={() => scrollBoard(-1)}
        >
          <Icon name="chevLeft" size={18} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          aria-label="Checklists suivantes"
          disabled={!canForward}
          onClick={() => scrollBoard(1)}
        >
          <Icon name="chevRight" size={18} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
