import type { RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Meeting } from "../../types";
import { isPastMeeting } from "../../utils";
import { Icon } from "../../../../shared/ui";
import { toDateKey } from "../../../../shared/utils/calendarGrid";

type MeetingUpcomingPanelProps = {
  meetings: Meeting[];
  isLoading: boolean;
  userEmail?: string | null;
  onOpenMeeting: (meeting: Meeting) => void;
  scrollRoot?: RefObject<HTMLDivElement | null>;
};

function formatMeetingTime(meeting: Meeting) {
  const date = new Date(`${meeting.date}T${meeting.start}:00`);
  if (Number.isNaN(date.getTime())) return meeting.start;

  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMeetingDay(meeting: Meeting) {
  const date = new Date(`${meeting.date}T12:00:00`);
  if (Number.isNaN(date.getTime())) return meeting.date;
  if (meeting.date === toDateKey(new Date())) return "Aujourd'hui";

  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function MeetingUpcomingPanel({
  meetings,
  isLoading,
  userEmail,
  onOpenMeeting,
  scrollRoot,
}: MeetingUpcomingPanelProps) {
  const reduceMotion = useReducedMotion();

  const upcoming = [...meetings]
    .filter((meeting) => {
      if (meeting.status === "ENDED" || meeting.status === "CANCELLED") {
        return false;
      }
      return meeting.status === "LIVE" || !isPastMeeting(meeting);
    })
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));

  const viewport = {
    root: scrollRoot,
    once: true,
    amount: 0.2 as const,
    margin: "0px 0px -40px 0px",
  };

  return (
    <motion.section
      className="w-full pb-4"
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="mb-4 flex items-end justify-between gap-3"
        initial={reduceMotion ? false : { opacity: 0, x: -16 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
        viewport={viewport}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            À venir
          </p>
          <h2 className="mt-1 text-[16px] font-semibold text-[var(--text)]">
            Vos réunions
          </h2>
        </div>
        {userEmail ? (
          <p className="max-w-[220px] truncate text-right text-[11px] text-[var(--muted)]">
            {userEmail}
          </p>
        ) : null}
      </motion.div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={`meeting-upcoming-skeleton-${index}`}
              className="flex items-center gap-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5"
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.4, delay: index * 0.07 }}
            >
              <div className="h-10 w-14 animate-pulse rounded-[10px] bg-[var(--surface-2)]" />
              <div className="h-4 flex-1 animate-pulse rounded bg-[var(--surface-2)]" />
            </motion.div>
          ))
        ) : upcoming.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-[var(--border)] px-4 py-8 text-center text-[13px] text-[var(--muted)]">
            Aucune réunion à venir.
          </p>
        ) : (
          upcoming.map((meeting, index) => {
            const live = meeting.status === "LIVE";
            return (
              <motion.button
                key={meeting.id}
                type="button"
                onClick={() => onOpenMeeting(meeting)}
                initial={
                  reduceMotion ? false : { opacity: 0, y: 28, filter: "blur(4px)" }
                }
                whileInView={
                  reduceMotion
                    ? undefined
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                viewport={viewport}
                transition={{
                  duration: 0.45,
                  delay: Math.min(index * 0.07, 0.35),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group flex w-full items-center gap-4 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left transition hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] hover:bg-[var(--surface-2)]"
              >
                <div className="flex w-[64px] shrink-0 flex-col">
                  <span className="font-mono text-[15px] font-semibold tabular-nums text-[var(--text)]">
                    {formatMeetingTime(meeting)}
                  </span>
                  <span className="mt-0.5 text-[11px] text-[var(--muted)]">
                    {formatMeetingDay(meeting)}
                  </span>
                </div>

                <div className="h-8 w-px shrink-0 bg-[var(--border)]" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-[var(--text)]">
                    {meeting.title}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">
                    {live
                      ? "En cours — rejoindre maintenant"
                      : meeting.end
                        ? `Jusqu'à ${meeting.end}`
                        : "Réunion Acredi"}
                  </p>
                </div>

                {live ? (
                  <span className="shrink-0 rounded-[8px] bg-[var(--green-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--green)]">
                    Live
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-[var(--muted)] transition group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]">
                    <Icon name="arrowRight" size={16} />
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </motion.section>
  );
}
