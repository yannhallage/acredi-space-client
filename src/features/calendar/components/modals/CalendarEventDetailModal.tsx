import { AnimatePresence, motion } from "framer-motion";
import { resolveEventColor } from "../../../../shared/api/callendar/normalizers";
import type { CalendarEvent } from "../../../../shared/api/callendar/types";
import { Avatar, Icon } from "../../../../shared/ui";
import {
  canJoinMeetingFromEvent,
  isManagedCalendarEvent,
} from "../../utils";

type CalendarEventDetailModalProps = {
  event: CalendarEvent | null;
  isDeleting?: boolean;
  onClose: () => void;
  onDelete?: (event: CalendarEvent) => void;
  onJoinMeeting?: (event: CalendarEvent) => void;
  onManageParticipants: (event: CalendarEvent) => void;
};

function formatDateTimeLine(event: CalendarEvent) {
  const datePart = event.start.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (event.allDay) {
    return `${capitalize(datePart)} · Journee entiere`;
  }

  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${capitalize(datePart)} · ${time.format(event.start)} – ${time.format(event.end)}`;
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatReminder(reminder: CalendarEvent["reminders"][number]) {
  const delay =
    reminder.minutesBefore === 0
      ? "au moment"
      : reminder.minutesBefore < 60
        ? `${reminder.minutesBefore} minutes avant`
        : reminder.minutesBefore === 60
          ? "1 heure avant"
          : reminder.minutesBefore === 1440
            ? "1 jour avant"
            : `${reminder.minutesBefore} minutes avant`;

  if (reminder.method === "EMAIL") {
    return `Email · ${delay}`;
  }

  return delay.charAt(0).toUpperCase() + delay.slice(1);
}

function getGuestStatusLabel(
  status: CalendarEvent["participants"][number]["status"],
) {
  switch (status) {
    case "ACCEPTED":
      return "Accepte";
    case "DECLINED":
      return "Refuse";
    case "TENTATIVE":
      return "Provisoire";
    default:
      return "Invite";
  }
}

function getParticipantName(
  participant: CalendarEvent["participants"][number],
) {
  return (
    `${participant.firstName} ${participant.lastName}`.trim() ||
    participant.email
  );
}

export function CalendarEventDetailModal({
  event,
  isDeleting = false,
  onClose,
  onDelete,
  onJoinMeeting,
  onManageParticipants,
}: CalendarEventDetailModalProps) {
  const eventColor = event
    ? resolveEventColor(event.color, event.type)
    : "#039BE5";
  const managed = event ? isManagedCalendarEvent(event) : false;
  const canJoin = event ? canJoinMeetingFromEvent(event) : false;

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="calendar-event-popover-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="calendar-event-popover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-detail-title"
            initial={{ opacity: 0, scale: 0.86, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <header className="calendar-event-popover-toolbar">
              <div className="calendar-event-popover-actions">
                {managed ? (
                  <>
                    <button
                      type="button"
                      className="calendar-event-popover-icon"
                      aria-label="Participants"
                      title="Participants"
                      onClick={() => onManageParticipants(event)}
                    >
                      <Icon name="edit" size={17} />
                    </button>
                    {onDelete ? (
                      <button
                        type="button"
                        className="calendar-event-popover-icon"
                        aria-label="Supprimer"
                        title="Supprimer"
                        disabled={isDeleting}
                        onClick={() => onDelete(event)}
                      >
                        <Icon name="trash" size={17} />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="calendar-event-popover-icon"
                      aria-label="Participants"
                      title="Inviter"
                      onClick={() => onManageParticipants(event)}
                    >
                      <Icon name="mail" size={17} />
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className="calendar-event-popover-icon"
                  aria-label="Plus d'options"
                  title="Options"
                >
                  <Icon name="moreH" size={17} />
                </button>
              </div>

              <button
                type="button"
                className="calendar-event-popover-icon"
                aria-label="Fermer"
                onClick={onClose}
              >
                <Icon name="x" size={17} />
              </button>
            </header>

            <div className="calendar-event-popover-hero">
              <span
                className="calendar-event-popover-color"
                style={{ backgroundColor: eventColor }}
                aria-hidden="true"
              />
              <div>
                <h2 id="calendar-detail-title">{event.title}</h2>
                <p>{formatDateTimeLine(event)}</p>
              </div>
            </div>

            {canJoin && onJoinMeeting ? (
              <button
                type="button"
                className="calendar-event-popover-invite"
                onClick={() => onJoinMeeting(event)}
              >
                <Icon name="video" size={15} />
                Rejoindre la reunion
              </button>
            ) : null}

            {managed ? (
              <button
                type="button"
                className="calendar-event-popover-invite"
                onClick={() => onManageParticipants(event)}
              >
                <Icon name="users" size={15} />
                Gerer les participants
              </button>
            ) : null}

            <div className="calendar-event-popover-body">
              {event.description ? (
                <div className="calendar-event-popover-row">
                  <Icon name="notes" size={18} />
                  <p className="calendar-event-popover-description">
                    {event.description}
                  </p>
                </div>
              ) : null}

              {event.location ? (
                <div className="calendar-event-popover-row">
                  <Icon
                    name={event.type === "MEETING" ? "video" : "pin"}
                    size={18}
                  />
                  <p>{event.location}</p>
                </div>
              ) : null}

              {event.reminders.length > 0 ? (
                <div className="calendar-event-popover-row">
                  <Icon name="bell" size={18} />
                  <div className="calendar-event-popover-stack">
                    {event.reminders.map((reminder, index) => (
                      <p key={`${reminder.method}-${reminder.minutesBefore}-${index}`}>
                        {formatReminder(reminder)}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="calendar-event-popover-row">
                <Icon name="calendar" size={18} />
                <p>
                  {event.type === "MEETING" ? "Reunion" : "Calendrier"}
                  {event.showAs === "FREE" ? " · Libre" : " · Occupe"}
                </p>
              </div>

              {event.participants.length > 0 ? (
                <div className="calendar-event-popover-row">
                  <Icon name="users" size={18} />
                  <div className="calendar-event-popover-stack">
                    <p>
                      {event.participants.length} participant
                      {event.participants.length > 1 ? "s" : ""}
                    </p>
                    <div className="calendar-event-popover-guests">
                      {event.participants.map((participant) => (
                        <div
                          className="calendar-event-popover-guest"
                          key={participant.id}
                        >
                          <Avatar
                            name={getParticipantName(participant)}
                            size={28}
                          />
                          <span>
                            <strong>{getParticipantName(participant)}</strong>
                            <small>
                              {getGuestStatusLabel(participant.status)}
                            </small>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
