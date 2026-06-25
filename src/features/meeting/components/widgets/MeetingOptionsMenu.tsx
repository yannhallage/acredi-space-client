import { motion } from "framer-motion";
import type { Meeting } from "../../types";

type MeetingOptionsMenuProps = {
  meeting: Meeting;
  position: { top: number; left: number };
  onOpenMeeting: (meeting: Meeting) => void;
  onAddParticipants: (meeting: Meeting) => void;
  onEdit: (meeting: Meeting) => void;
};

export function MeetingOptionsMenu({
  meeting,
  position,
  onOpenMeeting,
  onAddParticipants,
  onEdit,
}: MeetingOptionsMenuProps) {
  return (
    <motion.div
      className="fixed z-[9999] w-[220px] overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] py-1 text-[12px] text-[var(--text)] shadow-[var(--shadow)]"
      style={{ top: position.top, left: position.left }}
      onClick={(event) => event.stopPropagation()}
      initial={{
        opacity: 0,
        scale: 0.95,
        y: -8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
        y: -8,
      }}
      transition={{
        duration: 0.15,
        ease: "easeOut",
      }}
    >
      {meeting.joinUrl && (
        <button
          onClick={() => onOpenMeeting(meeting)}
          className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
          type="button"
        >
          Rejoindre la réunion
        </button>
      )}

      <button
        onClick={() => onAddParticipants(meeting)}
        className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
        type="button"
      >
        Ajouter un participant
      </button>

      <button
        onClick={() => onEdit(meeting)}
        className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
        type="button"
      >
        Modifier
      </button>
      <button
        onClick={() => onEdit(meeting)}
        className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
        type="button"
      >
        Annler
      </button>
    </motion.div>
  );
}
