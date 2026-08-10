import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface HoverTipProps {
  children: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  side?: "right" | "left" | "top" | "bottom";
}

interface TipCoords {
  top: number;
  left: number;
}

const OFFSET = 12;

export function HoverTip({
  children,
  content,
  disabled = false,
  side = "right",
}: HoverTipProps) {
  const tipId = useId();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<TipCoords | null>(null);

  const updatePosition = useCallback(() => {
    const node = triggerRef.current;

    if (!node) {
      return;
    }

    const rect = node.getBoundingClientRect();

    if (side === "right") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + OFFSET,
      });
      return;
    }

    if (side === "left") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.left - OFFSET,
      });
      return;
    }

    if (side === "top") {
      setCoords({
        top: rect.top - OFFSET,
        left: rect.left + rect.width / 2,
      });
      return;
    }

    setCoords({
      top: rect.bottom + OFFSET,
      left: rect.left + rect.width / 2,
    });
  }, [side]);

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    function handleReposition() {
      updatePosition();
    }

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updatePosition]);

  if (disabled) {
    return <>{children}</>;
  }

  const anchorStyle: CSSProperties | undefined = coords
    ? side === "right"
      ? {
          top: coords.top,
          left: coords.left,
          transform: "translateY(-50%)",
        }
      : side === "left"
        ? {
            top: coords.top,
            left: coords.left,
            transform: "translate(-100%, -50%)",
          }
        : side === "top"
          ? {
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, -100%)",
            }
          : {
              top: coords.top,
              left: coords.left,
              transform: "translate(-50%, 0)",
            }
    : undefined;

  const motionOffset =
    side === "right"
      ? { x: -6, y: 0 }
      : side === "left"
        ? { x: 6, y: 0 }
        : side === "top"
          ? { x: 0, y: 6 }
          : { x: 0, y: -6 };

  const portalTarget =
    typeof document !== "undefined"
      ? document.querySelector(".theme-root") ?? document.body
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="hover-tip-trigger"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocusCapture={() => setOpen(true)}
        onBlurCapture={() => setOpen(false)}
      >
        {children}
      </span>
      {portalTarget
        ? createPortal(
            <AnimatePresence>
              {open && coords ? (
                <span
                  className={`hover-tip-anchor hover-tip-anchor-${side}`}
                  style={anchorStyle}
                >
                  <motion.span
                    id={tipId}
                    className={`hover-tip hover-tip-${side}`}
                    role="tooltip"
                    initial={{ opacity: 0, ...motionOffset, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={{ opacity: 0, ...motionOffset, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {content}
                  </motion.span>
                </span>
              ) : null}
            </AnimatePresence>,
            portalTarget
          )
        : null}
    </>
  );
}
