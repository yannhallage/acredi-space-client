import { AnimatePresence, motion } from "framer-motion";
import type { CalendarEvent } from "../../shared/api/callendar/types";
import { Avatar, Icon } from "../../shared/ui";

type CalendarEventDetailModalProps = {
  event: CalendarEvent | null;
  onClose: () => void;
  onManageParticipants: (event: CalendarEvent) => void;
};

function formatDate(value: Date) {
  return value.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTimeRange(event: CalendarEvent) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formatter.format(event.start)} - ${formatter.format(event.end)}`;
}

function getParticipantName(participant: CalendarEvent["participants"][number]) {
  return `${participant.firstName} ${participant.lastName}`.trim() || participant.email;
}

export function CalendarEventDetailModal({
  event,
  onClose,
  onManageParticipants,
}: CalendarEventDetailModalProps) {
  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          className="note-modal-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="note-modal calendar-note-modal calendar-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-detail-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <header>
              <div>
                <h2 id="calendar-detail-title">{event.title}</h2>
                <span>{event.type === "MEETING" ? "Reunion" : "Evenement"}</span>
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

            <div className="calendar-detail-content">
              <div className="calendar-detail-row">
                <Icon name="calendar" size={18} />
                <div>
                  <strong>Date</strong>
                  <p>{formatDate(event.start)}</p>
                </div>
              </div>

              <div className="calendar-detail-row">
                <Icon name="clock" size={18} />
                <div>
                  <strong>Horaire</strong>
                  <p>{formatTimeRange(event)}</p>
                </div>
              </div>

              <div className="calendar-detail-row">
                <Icon name={event.type === "MEETING" ? "video" : "pin"} size={18} />
                <div>
                  <strong>Lieu</strong>
                  <p>{event.location || "Non renseigne"}</p>
                </div>
              </div>

              <div className="calendar-detail-row">
                <Icon name="users" size={18} />
                <div>
                  <strong>
                    {event.participants.length} participant
                    {event.participants.length > 1 ? "s" : ""}
                  </strong>

                  {event.participants.length > 0 ? (
                    <div className="calendar-detail-participants">
                      {event.participants.map((participant) => (
                        <div
                          className="calendar-detail-participant"
                          key={participant.id}
                        >
                          <Avatar
                            name={getParticipantName(participant)}
                            size={32}
                          />
                          <span>
                            <strong>{getParticipantName(participant)}</strong>
                            <small>{participant.email}</small>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Aucun participant ajoute.</p>
                  )}
                </div>
              </div>
            </div>

            <footer className="calendar-event-modal-actions">
              <button className="button ghost" type="button" onClick={onClose}>
                Fermer
              </button>

              <button
                className="button primary"
                type="button"
                onClick={() => onManageParticipants(event)}
              >
                <Icon name="users" size={14} />
                Participants
              </button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
