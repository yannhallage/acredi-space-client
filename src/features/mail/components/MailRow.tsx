import type { MailMessage } from "../types";
import {
  IconArchive,
  IconDelete,
  IconDrag,
  IconImportant,
  IconMarkRead,
  IconSnooze,
  IconStar,
} from "./MailIcons";

interface MailRowProps {
  message: MailMessage;
  selected: boolean;
  starred: boolean;
  onToggleSelect: () => void;
  onToggleStar: () => void;
}

export function MailRow({
  message,
  selected,
  starred,
  onToggleSelect,
  onToggleStar,
}: MailRowProps) {
  return (
    <div
      className={[
        "mail-row",
        message.unread ? "is-unread" : "",
        selected ? "is-selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="row"
    >
      <button type="button" className="mail-row__drag" tabIndex={-1} aria-hidden>
        <IconDrag />
      </button>

      <label className="mail-row__check">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select mail from ${message.sender}`}
        />
      </label>

      <button
        type="button"
        className={`mail-row__star${starred ? " is-on" : ""}`}
        aria-label={starred ? "Unstar" : "Star"}
        onClick={onToggleStar}
      >
        <IconStar filled={starred} />
      </button>

      <button
        type="button"
        className={`mail-row__important${message.important ? " is-on" : ""}`}
        aria-label="Important"
      >
        <IconImportant filled={message.important} />
      </button>

      <div className="mail-row__sender">{message.sender}</div>

      <div className="mail-row__content">
        <span className="mail-row__subject">{message.subject}</span>
        <span className="mail-row__snippet">{message.snippet}</span>
      </div>

      <div className="mail-row__meta">
        <span className="mail-row__date">{message.date}</span>
        <div className="mail-row__actions">
          {message.hoverPills?.map((pill) => (
            <button key={pill} type="button" className="mail-pill">
              {pill}
            </button>
          ))}
          <button type="button" className="mail-row-action" aria-label="Archive">
            <IconArchive />
          </button>
          <button type="button" className="mail-row-action" aria-label="Delete">
            <IconDelete />
          </button>
          <button type="button" className="mail-row-action" aria-label="Mark as read">
            <IconMarkRead />
          </button>
          <button type="button" className="mail-row-action" aria-label="Snooze">
            <IconSnooze />
          </button>
        </div>
      </div>
    </div>
  );
}
