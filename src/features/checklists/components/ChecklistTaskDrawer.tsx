import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { ChecklistItem } from "../../../shared/api/checklists";
import { Icon } from "../../../shared/ui";
import { formatDueDate, isOverdue } from "../utils";

type ChecklistTaskDrawerProps = {
  isOpen: boolean;
  item: ChecklistItem | null;
  listTitle?: string;
  onClose: () => void;
};

export function ChecklistTaskDrawer({
  isOpen,
  item,
  listTitle,
  onClose,
}: ChecklistTaskDrawerProps) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const dueLabel = item ? formatDueDate(item.dueDate) : "";
  const overdue = item ? isOverdue(item.dueDate, item.completed) : false;

  return (
    <AnimatePresence>
      {isOpen && item ? (
        <motion.div
          className="cl-drawer-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={onClose}
        >
          <motion.aside
            className="cl-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cl-drawer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="cl-drawer-head">
              <div>
                {listTitle ? <p className="cl-drawer-kicker">{listTitle}</p> : null}
                <h2 id="cl-drawer-title">{item.title}</h2>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Fermer"
                onClick={onClose}
              >
                <Icon name="x" size={16} />
              </button>
            </header>

            <div className="cl-drawer-body">
              <p className={item.completed ? "cl-drawer-status is-done" : "cl-drawer-status"}>
                {item.completed ? "Terminée" : "À faire"}
              </p>

              {dueLabel ? (
                <span className={overdue ? "cl-due overdue" : "cl-due"}>
                  <Icon name="calendar" size={12} />
                  {dueLabel}
                </span>
              ) : (
                <p className="cl-drawer-empty">Aucune échéance</p>
              )}

              <section className="cl-drawer-section">
                <h3>Description</h3>
                {item.description ? (
                  <p className="cl-drawer-description">{item.description}</p>
                ) : (
                  <p className="cl-drawer-empty">Aucune description</p>
                )}
              </section>

              {item.children?.length ? (
                <section className="cl-drawer-section">
                  <h3>Sous-tâches</h3>
                  <ul className="cl-drawer-subtasks">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <input
                          className="cl-check"
                          type="checkbox"
                          checked={child.completed}
                          disabled
                          readOnly
                          aria-hidden="true"
                        />
                        <span className={child.completed ? "done" : undefined}>
                          {child.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
