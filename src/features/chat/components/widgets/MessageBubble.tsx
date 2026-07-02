import { useState } from "react";

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
}

export function MessageBubble({ message, avatarSrc }: MessageBubbleProps) {
  const { user } = useAuth();
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const mine = user?.id === message.senderId;

  const statusLabel = message.failed
    ? "échec"
    : message.pending
      ? "envoi..."
      : null;

  const { text, attachment } = parseMessageContent(message.content);

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

  return (
    <article className={mine ? "message-bubble mine" : "message-bubble"}>
      {!mine ? (
        <Avatar name={message.senderName} size={28} src={avatarSrc} />
      ) : null}

      <div>
        <header>
          <strong>{mine ? "Vous" : message.senderName}</strong>
          <small>
            {formatMessageTime(message.createdAt)}
            {statusLabel ? ` · ${statusLabel}` : ""}
          </small>
        </header>

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
      </div>
    </article>
  );
}
