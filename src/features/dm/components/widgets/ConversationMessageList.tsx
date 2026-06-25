import { useState, type RefObject } from "react";

import type { Presence } from "../../../../shared/types";
import {
  downloadFileById,
  downloadFileFromUrl,
} from "../../../../shared/utils/downloadFile";
import { Avatar, Icon } from "../../../../shared/ui";

import {
  formatAttachmentSize,
  formatTime,
  getAttachmentExtension,
  type LocalAttachment,
  type LocalMessage,
} from "../utils/dmMessageFormat";

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="dm-date-separator">
      <span />
      <p>{label}</p>
      <span />
    </div>
  );
}

function MessageAttachmentItem({
  attachment,
}: {
  attachment: LocalAttachment;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const meta = `${getAttachmentExtension(attachment)} - ${formatAttachmentSize(
    attachment.sizeBytes
  )}`;

  async function handleDownload() {
    if (attachment.pending || downloading) {
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      if (attachment.downloadUrl) {
        await downloadFileFromUrl(attachment.downloadUrl, attachment.name);
        return;
      }

      if (attachment.id && !attachment.id.startsWith("pending-file-")) {
        await downloadFileById(attachment.id, attachment.name);
        return;
      }

      throw new Error("download-unavailable");
    } catch {
      setDownloadError("Impossible de telecharger le fichier.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        className="dm-attachment-item"
        type="button"
        disabled={attachment.pending || downloading}
        onClick={() => {
          void handleDownload();
        }}
      >
        <span className="dm-attachment-icon">
          <Icon name={attachment.pending ? "upload" : "file"} size={15} />
        </span>
        <span className="dm-attachment-copy">
          <strong>{attachment.name}</strong>
          <small>
            {attachment.pending
              ? "Envoi..."
              : downloading
                ? "Telechargement..."
                : meta}
          </small>
        </span>
        <Icon name={attachment.pending ? "upload" : "download"} size={14} />
      </button>
      {downloadError ? (
        <small className="dm-attachment-error">{downloadError}</small>
      ) : null}
    </>
  );
}

function MessageAttachmentList({
  attachments,
}: {
  attachments: LocalAttachment[];
}) {
  if (!attachments.length) {
    return null;
  }

  return (
    <div className="dm-attachment-list">
      {attachments.map((attachment) => (
        <MessageAttachmentItem key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}

function DirectMessageRow({
  message,
  isMine,
  senderLabel,
  presence,
  avatarSrc,
}: {
  message: LocalMessage;
  isMine: boolean;
  senderLabel: string;
  presence?: Presence;
  avatarSrc?: string | null;
}) {
  const time = formatTime(message.createdAt);
  const status = message.failed
    ? "Echec d'envoi"
    : message.pending
      ? "Envoi..."
      : "Envoye";
  const attachments = message.attachments ?? [];
  const hasContent = Boolean(message.content?.trim());

  return (
    <article className={`dm-message-row ${isMine ? "mine" : ""}`}>
      {!isMine ? (
        <Avatar
          name={senderLabel}
          presence={presence}
          size={34}
          src={avatarSrc}
        />
      ) : null}

      <div className="dm-message-content">
        <div className="dm-message-meta">
          <strong>{isMine ? "Vous" : senderLabel}</strong>
          {time ? <time>{time}</time> : null}
        </div>

        <div className="dm-message-bubble">
          {hasContent ? <p>{message.content}</p> : null}
          <MessageAttachmentList attachments={attachments} />
          {!hasContent && !attachments.length ? <p>{message.content}</p> : null}
        </div>

        <div className="dm-message-footer">
          {isMine ? (
            <span className={message.failed ? "failed" : ""}>{status}</span>
          ) : (
            <span>Recu</span>
          )}

          {!message.pending && !message.failed ? (
            <div className="dm-message-tools" aria-hidden="true">
              <button type="button" tabIndex={-1}>
                <Icon name="smile" size={13} />
              </button>
              <button type="button" tabIndex={-1}>
                <Icon name="arrowRight" size={13} />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isMine ? (
        <Avatar name={senderLabel} size={34} src={avatarSrc} />
      ) : null}
    </article>
  );
}

interface ConversationMessageListProps {
  title: string;
  presence: Presence;
  avatarUrl?: string | null;
  messageGroups: Array<{
    dateKey: string;
    label: string;
    items: LocalMessage[];
  }>;
  messageListRef: RefObject<HTMLDivElement | null>;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatarUrl?: string | null;
}

export function ConversationMessageList({
  title,
  presence,
  avatarUrl,
  messageGroups,
  messageListRef,
  currentUserId,
  currentUserName,
  currentUserAvatarUrl,
}: ConversationMessageListProps) {
  return (
    <main ref={messageListRef} className="dm-thread-body">
      {messageGroups.length === 0 ? (
        <div className="dm-thread-empty">
          <div>
            <h3>Demarre la conversation</h3>
            <p>
              Ecris un premier message a {title}. Le fil restera vide tant que
              l'API ne renvoie aucun message.
            </p>
          </div>
        </div>
      ) : (
        messageGroups.map((group) => (
          <div className="dm-message-group" key={group.dateKey}>
            <DateSeparator label={group.label} />

            {group.items.map((message) => {
              const isMine = currentUserId === message.senderId;
              const senderLabel = isMine
                ? currentUserName || message.senderName || "Vous"
                : message.senderName || title;

              return (
                <DirectMessageRow
                  key={message.id}
                  message={message}
                  isMine={isMine}
                  senderLabel={senderLabel}
                  presence={presence}
                  avatarSrc={isMine ? currentUserAvatarUrl : avatarUrl}
                />
              );
            })}
          </div>
        ))
      )}
    </main>
  );
}
