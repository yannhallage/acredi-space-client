import { AnimatePresence, motion } from "framer-motion";
import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { useTheme } from "../../../../shared/theme/ThemeProvider";
import { Icon, type IconName } from "../../../../shared/ui";

type MenuCoords = {
  left: number;
  top: number;
};

function getMenuPosition(
  trigger: DOMRect,
  menuWidth: number,
  menuHeight: number,
): MenuCoords {
  const gap = 6;
  const padding = 12;
  let top = trigger.bottom + gap;
  let left = trigger.right - menuWidth;

  if (left < padding) {
    left = trigger.left;
  }

  if (left + menuWidth > window.innerWidth - padding) {
    left = Math.max(padding, window.innerWidth - menuWidth - padding);
  }

  if (top + menuHeight > window.innerHeight - padding) {
    top = trigger.top - menuHeight - gap;
  }

  if (top < padding) {
    top = padding;
  }

  return { left, top };
}

function getPortalRoot() {
  return document.querySelector(".theme-root") ?? document.body;
}

export function FilesActionsDropdown({
  children,
  icon = "moreV",
  isOpen,
  label,
  onToggle,
  triggerClassName = "files-actions-trigger",
}: {
  children: ReactNode;
  icon?: IconName;
  isOpen: boolean;
  label: string;
  onToggle: () => void;
  triggerClassName?: string;
}) {
  const { palette } = useTheme();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<MenuCoords | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    function updatePosition() {
      const trigger = triggerRef.current?.getBoundingClientRect();

      if (!trigger) {
        return;
      }

      const menuBox = menuRef.current?.getBoundingClientRect();
      setCoords(
        getMenuPosition(trigger, menuBox?.width ?? 160, menuBox?.height ?? 120),
      );
    }

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        className={triggerClassName}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
      >
        <Icon name={icon} size={14} />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              ref={menuRef}
              className="files-actions-menu"
              role="menu"
              style={{
                left: coords?.left ?? 0,
                top: coords?.top ?? -9999,
                visibility: coords ? "visible" : "hidden",
                background: palette.surface,
                borderColor: palette.border,
                color: palette.text,
                boxShadow: palette.shadow,
              }}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: coords ? 1 : 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {children}
            </motion.div>
          ) : null}
        </AnimatePresence>,
        getPortalRoot(),
      )}
    </>
  );
}
