import { useState, type MouseEvent } from "react";

import {
  MessageActionsMenu,
  type MessageAction,
  type MessageMenuAnchor,
} from "../../../../shared/components/messaging";
import { downloadFileById } from "../../../../shared/utils/downloadFile";
import { useAuth } from "../../../../shared/context";
import { Avatar, Icon } from "../../../../shared/ui";

import {
  formatMessageTime,
  parseMessageContent,
  type LocalGroupMessage,
} from "../../utils/messageFormat";

interface MessageBubbleProps {
  message: LocalGroupMessage;
  avatarSrc?: string | null;
  currentUserId?: string;
}

export function MessageBubble({
  message,
  avatarSrc,
  currentUserId,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const mine = (currentUserId ?? user?.id) === message.senderId;
  const isDeleted = Boolean(message.deleted);

  const statusLabel = message.failed
    ? "échec"
    : message.pending
      ? "envoi..."
      : null;

  const { text, attachment } = isDeleted
    ? { text: "", attachment: null }
    : parseMessageContent(message.content);

  async function handleDownloadAttachment() {
    if (!attachment?.id) {
      return;
    }

    try {
      setDownloadError(null);
      await downloadFileById(attachment.id, attachment.name);
    } catch {
      setDownloadError("Impossible de telecharger le fichier.");
    }
  }

  function handleBubbleContextMenu(event: MouseEvent<HTMLElement>) {
    if (!canAct) return;

    const target = event.target as HTMLElement;
    if (target.closest("button, input, textarea, .message-file-attachment")) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onOpenMenu({ x: event.clientX, y: event.clientY });
  }

  return (
    <article
      className={mine ? "message-bubble mine" : "message-bubble"}
      onContextMenu={handleBubbleContextMenu}
    >
      {!mine ? (
        <Avatar name={message.senderName} size={28} src={avatarSrc} />
      ) : null}

      <div>
        <header>
          <strong>{mine ? "Vous" : message.senderName}</strong>
          <small>
            {formatMessageTime(message.createdAt)}
            {message.editedAt && !isDeleted ? " · modifié" : ""}
            {statusLabel ? ` · ${statusLabel}` : ""}
          </small>
        </header>

        {isDeleted ? (
          <p className="deleted-message-text">
            <span aria-hidden="true">🚫</span>{" "}
            {mine
              ? "Vous avez supprimé ce message"
              : "Ce message a été supprimé"}
          </p>
        ) : (
          <>
            {text ? <p>{text}</p> : null}

            {attachment ? (
              <button
                className="message-file-attachment"
                type="button"
                disabled={!attachment.id}
                onClick={() => {
                  void handleDownloadAttachment();
                }}
              >
                <Icon name="paperclip" size={14} />
                <span>{attachment.name}</span>
                <small>{attachment.id ? "Télécharger" : "Envoi..."}</small>
              </button>
            ) : null}

            {downloadError ? (
              <small className="chat-send-error">{downloadError}</small>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}