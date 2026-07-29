import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Meeting } from "../../types";
import { isPastMeeting } from "../../utils";
import { Icon } from "../../../../shared/ui";
import { toDateKey } from "../../../../shared/utils/calendarGrid";
import { useTheme } from "../../../../shared/theme";

type MeetingStageVisualProps = {
  meetings: Meeting[];
  isLoading: boolean;
  onOpenMeeting: (meeting: Meeting) => void;
};

const EMPTY_SLIDES = [
  {
    image: "/meeting/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg",
    title: "Un lien, et c’est parti",
    description: "Créez une salle et partagez-la en un clic.",
  },
  {
    image: "/meeting/user_edu_safety_light_e04a2bbb449524ef7e49ea36d5f25b65.svg",
    title: "Sécurisé par défaut",
    description: "Personne n’entre sans invitation ou admission.",
  },
  {
    image: "/meeting/user_edu_scheduling_light_b352efa017e4f8f1ffda43e847820322.svg",
    title: "Planifiez à l’avance",
    description: "Réservez un créneau dans votre calendrier Acredi.",
  },
] as const;

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

function getUpcoming(meetings: Meeting[]) {
  return [...meetings]
    .filter((meeting) => {
      if (meeting.status === "ENDED" || meeting.status === "CANCELLED") {
        return false;
      }
      return meeting.status === "LIVE" || !isPastMeeting(meeting);
    })
    .sort((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
}

function EmptyStage() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const slide = EMPTY_SLIDES[index];

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % EMPTY_SLIDES.length);
    }, 4800);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center px-5 py-6 text-center sm:px-6">
      <div className="relative mb-4 flex h-[min(42%,200px)] w-full max-w-[240px] items-center justify-center sm:h-[min(48%,240px)] sm:max-w-[260px]">
        <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)] blur-2xl" />
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.image}
            src={slide.image}
            alt=""
            draggable={false}
            className="relative z-[1] h-full w-full object-contain"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={slide.title}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--text)]">
            {slide.title}
          </h2>
          <p className="mx-auto mt-2 max-w-[28ch] text-[13px] leading-relaxed text-[var(--muted-soft)]">
            {slide.description}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center gap-2">
        {EMPTY_SLIDES.map((item, slideIndex) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Slide ${slideIndex + 1}`}
            aria-current={slideIndex === index}
            onClick={() => setIndex(slideIndex)}
            className={`h-1.5 rounded-full transition-all ${
              slideIndex === index
                ? "w-5 bg-[var(--accent)]"
                : "w-1.5 bg-[color-mix(in_srgb,var(--muted)_40%,transparent)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function MeetingsStage({
  meetings,
  isLoading,
  onOpenMeeting,
}: {
  meetings: Meeting[];
  isLoading: boolean;
  onOpenMeeting: (meeting: Meeting) => void;
}) {
  const reduceMotion = useReducedMotion();
  const upcoming = getUpcoming(meetings);

  return (
    <div className="flex h-full min-h-0 flex-col p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
            Agenda
          </p>
          <h2 className="mt-0.5 text-[15px] font-semibold text-[var(--text)]">
            Vos réunions
          </h2>
        </div>
        <span className="rounded-[8px] bg-[var(--surface-2)] px-2.5 py-1 font-mono text-[11px] text-[var(--muted-soft)]">
          {isLoading ? "…" : upcoming.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`stage-skeleton-${index}`}
              className="flex items-center gap-3 rounded-[12px] bg-[var(--surface-2)] px-3 py-3"
            >
              <div className="h-9 w-12 animate-pulse rounded-[8px] bg-[var(--surface-3)]" />
              <div className="h-3 flex-1 animate-pulse rounded bg-[var(--surface-3)]" />
            </div>
          ))
        ) : (
          upcoming.map((meeting, index) => {
            const live = meeting.status === "LIVE";
            return (
              <motion.button
                key={meeting.id}
                type="button"
                onClick={() => onOpenMeeting(meeting)}
                initial={reduceMotion ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: Math.min(index * 0.06, 0.3),
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group flex w-full items-center gap-3 rounded-[12px] border border-transparent bg-[var(--surface-2)] px-3 py-3 text-left transition hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--surface-2))]"
              >
                <div className="w-[52px] shrink-0">
                  <p className="font-mono text-[13px] font-semibold tabular-nums text-[var(--text)]">
                    {formatMeetingTime(meeting)}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    {formatMeetingDay(meeting)}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[var(--text)]">
                    {meeting.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
                    {live ? "En cours" : `${meeting.start} – ${meeting.end}`}
                  </p>
                </div>

                {live ? (
                  <span className="shrink-0 rounded-[7px] bg-[var(--green-soft)] px-2 py-1 text-[10px] font-semibold text-[var(--green)]">
                    Live
                  </span>
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] text-[var(--muted)] transition group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]">
                    <Icon name="arrowRight" size={14} />
                  </span>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function MeetingStageVisual({
  meetings,
  isLoading,
  onOpenMeeting,
}: MeetingStageVisualProps) {
  const { dark } = useTheme();
  const upcoming = getUpcoming(meetings);
  const showMeetings = isLoading || upcoming.length > 0;

  return (
    <div className="relative isolate h-full min-h-0 w-full overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(ellipse at 80% 0%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%), linear-gradient(165deg, var(--surface-2), var(--surface))"
            : "radial-gradient(ellipse at 80% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%), linear-gradient(165deg, #fafafa, var(--surface))",
        }}
      />

      <div className="relative z-[1] h-full min-h-0">
        {showMeetings ? (
          <MeetingsStage
            meetings={meetings}
            isLoading={isLoading}
            onOpenMeeting={onOpenMeeting}
          />
        ) : (
          <EmptyStage />
        )}
      </div>
    </div>
  );
}
