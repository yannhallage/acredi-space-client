import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { resolveAssetUrl } from "../../../shared/api/http";
import type { Presence } from "../../../shared/types";

interface AvatarPreviewOverlayProps {
  name: string;
  onClose: () => void;
  open: boolean;
  presence?: Presence;
  src?: string | null;
}

export function AvatarPreviewOverlay({
  name,
  onClose,
  open,
  presence,
  src,
}: AvatarPreviewOverlayProps) {
  const resolvedSrc = resolveAssetUrl(src);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && resolvedSrc ? (
        <motion.div
          className="dm-avatar-preview-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo de profil de ${name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className="dm-avatar-preview-stage"
            initial={{ opacity: 0, scale: 0.72, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.84, y: 8 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 34,
              mass: 0.86,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="dm-avatar-preview-ring">
              <motion.img
                alt={name}
                className="dm-avatar-preview-image"
                src={resolvedSrc}
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                exit={{ scale: 1.04 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
              {presence ? (
                <span
                  className={`presence presence-${presence} dm-avatar-preview-presence`}
                />
              ) : null}
            </div>

            <motion.p
              className="dm-avatar-preview-name"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ delay: 0.05, duration: 0.18 }}
            >
              {name}
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
