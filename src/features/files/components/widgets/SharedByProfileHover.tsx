import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import type { User } from "../../../../shared/types";
import { Avatar, Icon } from "../../../../shared/ui";

const cardMotion = {
  initial: { opacity: 0, y: 8, scale: 0.94, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 28,
      mass: 0.7,
    },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.96,
    filter: "blur(3px)",
    transition: { duration: 0.14, ease: "easeIn" as const },
  },
};

const actionsMotion = {
  animate: {
    transition: { staggerChildren: 0.045, delayChildren: 0.05 },
  },
};

const actionItemMotion = {
  initial: { opacity: 0, y: 6, scale: 0.85 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 500, damping: 24 },
  },
};

export function SharedByProfileHover({
  user,
}: {
  user: User;
}) {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function openCard() {
    clearCloseTimer();
    setOpen(true);
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 180);
  }

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;

      if (target && rootRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={open ? "files-shared-by open" : "files-shared-by"}
      onMouseEnter={openCard}
      onMouseLeave={scheduleClose}
    >
      <button
        className="files-shared-by-trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <Avatar name={user.name} size={22} src={user.avatarUrl} />
        <span>{user.email || user.name}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="files-shared-by-card"
            role="dialog"
            aria-label={`Profil de ${user.name}`}
            variants={cardMotion}
            initial="initial"
            animate="animate"
            exit="exit"
            onMouseEnter={openCard}
            onMouseLeave={scheduleClose}
            onClick={(event) => event.stopPropagation()}
          >
            <motion.div
              className="files-shared-by-card-header"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04, duration: 0.2 }}
            >
              <Avatar name={user.name} size={40} src={user.avatarUrl} />
              <div className="files-shared-by-card-identity">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
            </motion.div>

            <motion.div
              className="files-shared-by-card-actions"
              role="group"
              aria-label="Actions profil"
              variants={actionsMotion}
              initial="initial"
              animate="animate"
            >
              <motion.a
                className="files-shared-by-card-action"
                href={`mailto:${user.email}`}
                aria-label="Envoyer un e-mail"
                title="E-mail"
                variants={actionItemMotion}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.94 }}
              >
                <Icon name="mail" size={15} />
              </motion.a>
              <motion.button
                className="files-shared-by-card-action"
                type="button"
                aria-label="Ouvrir le chat"
                title="Chat"
                variants={actionItemMotion}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate("/app/dm")}
              >
                <Icon name="message" size={15} />
              </motion.button>
              <motion.button
                className="files-shared-by-card-action"
                type="button"
                aria-label="Demarrer une reunion"
                title="Reunion"
                variants={actionItemMotion}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate("/app/meeting/meet-daily")}
              >
                <Icon name="video" size={15} />
              </motion.button>
              <motion.button
                className="files-shared-by-card-action"
                type="button"
                aria-label="Ouvrir le calendrier"
                title="Calendrier"
                variants={actionItemMotion}
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate("/app/calendar")}
              >
                <Icon name="calendar" size={15} />
              </motion.button>
            </motion.div>

            <motion.button
              className="files-shared-by-card-detail"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.16, duration: 0.18 }}
              whileHover={{ x: 2 }}
              onClick={() =>
                navigate(`/app/users/${user.id}`, {
                  state: { user },
                })
              }
            >
              Ouvrir la vue detaillee
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
