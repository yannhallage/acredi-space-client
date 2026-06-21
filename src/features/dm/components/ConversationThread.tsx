import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { EmojiClickData, Theme } from "emoji-picker-react";

import { useSendMessageMutation } from "../../../shared/api/dm/hooks";
import type {
  ChatAttachmentResponse,
  MessageResponse,
} from "../../../shared/api/dm/types";
import { useAuth } from "../../../shared/context";
import type { Presence } from "../../../shared/types";
import {
  downloadFileById,
  downloadFileFromUrl,
} from "../../../shared/utils/downloadFile";
import { Avatar, Icon } from "../../../shared/ui";

type LocalAttachment = ChatAttachmentResponse & {
  pending?: boolean;
};

type LocalMessage = MessageResponse & {
  attachments?: LocalAttachment[];
  pending?: boolean;
  failed?: boolean;
};

const EmojiPicker = lazy(() => import("emoji-picker-react"));

interface DirectConversationThreadProps {
  channelId: string;
  title: string;
  subtitle?: string;
  presence?: Presence;
  avatarUrl?: string | null;
  messages: MessageResponse[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onClose?: () => void;
}

function formatTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateSeparator(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Conversation";
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return "Aujourd'hui";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function getPresenceLabel(presence: Presence) {
  switch (presence) {
    case "online":
      return "En ligne";
    case "busy":
      return "Occupe";
    case "away":
      return "Absent";
    case "dnd":
      return "Concentre";
    case "offline":
    default:
      return "Hors ligne";
  }
}

function formatSubtitle(value: string) {
  const normalized = value.trim().toUpperCase();

  switch (normalized) {
    case "ADMIN":
      return "Admin";
    case "COLLABORATOR":
      return "Collaborateur";
    case "MANAGER":
      return "Manager";
    case "OWNER":
      return "Owner";
    default:
      return value;
  }
}

function formatAttachmentSize(sizeBytes: number) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return "0 o";
  }

  if (sizeBytes < 1024) {
    return `${sizeBytes} o`;
  }

  const units = ["Ko", "Mo", "Go", "To"];
  let value = sizeBytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function getAttachmentExtension(attachment: Pick<LocalAttachment, "contentType" | "name">) {
  const nameExtension = attachment.name.includes(".")
    ? attachment.name.split(".").pop()
    : undefined;
  const mimeExtension = attachment.contentType?.split("/").pop();
  const extension = nameExtension || mimeExtension || "file";

  return extension.slice(0, 8).toUpperCase();
}

function getAttachmentSignature(
  attachments?: Array<Pick<LocalAttachment, "name" | "sizeBytes">>
) {
  return (attachments ?? [])
    .map((attachment) => `${attachment.name}:${attachment.sizeBytes}`)
    .sort()
    .join("|");
}

function isSameSelectedFile(firstFile: File, secondFile: File) {
  return (
    firstFile.name === secondFile.name &&
    firstFile.size === secondFile.size &&
    firstFile.lastModified === secondFile.lastModified
  );
}

function createPendingAttachments(files: File[]): LocalAttachment[] {
  return files.map((file, index) => ({
    id: `pending-file-${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    contentType: file.type || null,
    sizeBytes: file.size,
    downloadUrl: "",
    pending: true,
  }));
}

function messageMatchesPending(
  message: MessageResponse,
  pendingMessage: LocalMessage
) {
  const sameContent =
    (message.content ?? "") === (pendingMessage.content ?? "");
  const sameSender = message.senderId === pendingMessage.senderId;
  const closeCreatedAt =
    Math.abs(
      new Date(message.createdAt).getTime() -
        new Date(pendingMessage.createdAt).getTime()
    ) < 10000;
  const pendingAttachments = getAttachmentSignature(pendingMessage.attachments);

  if (!sameContent || !sameSender || !closeCreatedAt) {
    return false;
  }

  return (
    !pendingAttachments ||
    pendingAttachments === getAttachmentSignature(message.attachments)
  );
}

function groupMessagesByDay(messages: LocalMessage[]) {
  const groups: Array<{
    dateKey: string;
    label: string;
    items: LocalMessage[];
  }> = [];

  messages.forEach((message) => {
    const dateKey = message.createdAt?.slice(0, 10) || "unknown";
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.dateKey !== dateKey) {
      groups.push({
        dateKey,
        label: formatDateSeparator(message.createdAt),
        items: [message],
      });

      return;
    }

    lastGroup.items.push(message);
  });

  return groups;
}

function ThreadSkeleton() {
  return (
    <section className="dm-thread dm-thread-skeleton" aria-hidden="true">
      <header className="dm-thread-header">
        <div className="dm-thread-user">
          <span className="skeleton-avatar dm-skeleton-header-avatar" />
          <div className="skeleton-copy">
            <span className="skeleton-line dm-skeleton-header-title" />
            <span className="skeleton-line dm-skeleton-header-subtitle" />
          </div>
        </div>

        <div className="dm-thread-actions">
          <span className="skeleton-pill dm-skeleton-action" />
          <span className="skeleton-pill dm-skeleton-action" />
        </div>
      </header>

      <main className="dm-thread-body">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            className={`dm-message-row ${index % 2 ? "mine" : ""}`}
            key={`dm-thread-skeleton-${index}`}
          >
            <span className="skeleton-avatar dm-skeleton-message-avatar" />
            <div className="skeleton-copy">
              <span className="skeleton-line dm-skeleton-message-meta" />
              <span className="skeleton-line dm-skeleton-message-body" />
              <span className="skeleton-line dm-skeleton-message-seen" />
            </div>
          </article>
        ))}
      </main>
    </section>
  );
}

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
        <Icon
          name={attachment.pending ? "upload" : "download"}
          size={14}
        />
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

export function DirectConversationThread({
  channelId,
  title,
  subtitle = "Message direct",
  presence = "offline",
  avatarUrl,
  messages,
  loading = false,
  refreshing = false,
  onRefresh,
  onClose,
}: DirectConversationThreadProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const sendMessageMutation = useSendMessageMutation();
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const messageGroups = useMemo(
    () => groupMessagesByDay(localMessages),
    [localMessages]
  );
  const subtitleLabel = formatSubtitle(subtitle);
  const canSend =
    (Boolean(content.trim()) || selectedFiles.length > 0) &&
    !sendMessageMutation.isPending;

  useEffect(() => {
    setLocalMessages((currentMessages) => {
      const pendingMessages = currentMessages.filter(
        (message) => message.pending || message.failed
      );

      const pendingWithoutDuplicate = pendingMessages.filter(
        (pendingMessage) =>
          !messages.some((message) =>
            messageMatchesPending(message, pendingMessage)
          )
      );

      return [...messages, ...pendingWithoutDuplicate];
    });
  }, [messages]);

  useEffect(() => {
    const list = messageListRef.current;

    if (!list) return;

    list.scrollTop = list.scrollHeight;
  }, [localMessages, channelId]);

  useEffect(() => {
    setContent("");
    setSelectedFiles([]);
    setEmojiPickerOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [channelId]);

  useEffect(() => {
    if (!emojiPickerOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setEmojiPickerOpen(false);
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setEmojiPickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [emojiPickerOpen]);

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setSelectedFiles((currentFiles) => {
      const nextFiles = [...currentFiles];

      files.forEach((file) => {
        if (
          !nextFiles.some((selectedFile) =>
            isSameSelectedFile(selectedFile, file)
          )
        ) {
          nextFiles.push(file);
        }
      });

      return nextFiles;
    });

    event.target.value = "";
  }

  function handleRemoveSelectedFile(index: number) {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = content.trim();
    const files = [...selectedFiles];

    if ((!value && !files.length) || !user?.id || sendMessageMutation.isPending) {
      return;
    }

    const temporaryId = `temp-${channelId}-${Date.now()}`;
    const temporaryMessage: LocalMessage = {
      id: temporaryId,
      channelId,
      senderId: user.id,
      senderName: user.name || "Vous",
      content: value,
      createdAt: new Date().toISOString(),
      attachments: createPendingAttachments(files),
      pending: true,
    };

    setLocalMessages((currentMessages) => [
      ...currentMessages,
      temporaryMessage,
    ]);
    setContent("");
    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    sendMessageMutation.mutate(
      {
        channelId,
        content: value,
        files: files.length ? files : undefined,
      },
      {
        onSuccess: (savedMessage) => {
          setLocalMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === temporaryId ? savedMessage : message
            )
          );
        },
        onError: () => {
          setLocalMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === temporaryId
                ? {
                    ...message,
                    pending: false,
                    failed: true,
                  }
                : message
            )
          );
        },
      }
    );
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function handleEmojiSelect(emojiData: EmojiClickData) {
    const textarea = textareaRef.current;
    const cursorStart = textarea?.selectionStart ?? content.length;
    const cursorEnd = textarea?.selectionEnd ?? content.length;
    const nextContent =
      content.slice(0, cursorStart) +
      emojiData.emoji +
      content.slice(cursorEnd);
    const nextCursorPosition = cursorStart + emojiData.emoji.length;

    setContent(nextContent);
    setEmojiPickerOpen(false);

    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  }

  if (loading) {
    return <ThreadSkeleton />;
  }

  return (
    <section className="dm-thread">
      <div className="dm-thread-main">
        <header className="dm-thread-header">
          <div className="dm-thread-user">
            <Avatar
              name={title}
              presence={presence}
              size={46}
              src={avatarUrl}
            />

            <div>
              <h2>{title}</h2>
              <p>
                <span className={`dm-dot dm-dot-${presence}`} />
                <span>{subtitleLabel}</span>
                <small>{getPresenceLabel(presence)}</small>
              </p>
            </div>
          </div>

          <div className="dm-thread-actions">
            <button
              type="button"
              aria-label="Recharger la discussion"
              title="Recharger"
              disabled={refreshing || !onRefresh}
              onClick={() => onRefresh?.()}
            >
              <Icon
                name="refresh"
                size={17}
                className={refreshing ? "dm-spin" : undefined}
              />
            </button>
            {onClose ? (
              <button
                type="button"
                aria-label="Fermer la discussion"
                title="Fermer"
                onClick={onClose}
              >
                <Icon name="x" size={17} />
              </button>
            ) : null}
          </div>
        </header>

        <main ref={messageListRef} className="dm-thread-body">
          {messageGroups.length === 0 ? (
            <div className="dm-thread-empty">
              <div>
                {/* <Icon name="message" size={24} /> */}
                <h3>Demarre la conversation</h3>
                <p>
                  Ecris un premier message a {title}. Le fil restera vide tant
                  que l'API ne renvoie aucun message.
                </p>
              </div>
            </div>
          ) : (
            messageGroups.map((group) => (
              <div className="dm-message-group" key={group.dateKey}>
                <DateSeparator label={group.label} />

                {group.items.map((message) => {
                  const isMine = user?.id === message.senderId;
                  const senderLabel = isMine
                    ? user?.name || message.senderName || "Vous"
                    : message.senderName || title;

                  return (
                    <DirectMessageRow
                      key={message.id}
                      message={message}
                      isMine={isMine}
                      senderLabel={senderLabel}
                      presence={presence}
                      avatarSrc={isMine ? user?.avatarUrl : avatarUrl}
                    />
                  );
                })}
              </div>
            ))
          )}
        </main>

        <form onSubmit={handleSubmit} className="dm-composer">
          <div className="dm-composer-shell">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder={`Ecrire a ${title}...`}
              rows={2}
            />

            <input
              ref={fileInputRef}
              className="dm-file-input"
              type="file"
              multiple
              onChange={handleFileInputChange}
            />

            {selectedFiles.length ? (
              <div className="dm-selected-files" aria-live="polite">
                {selectedFiles.map((file, index) => (
                  <span
                    className="dm-selected-file"
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                  >
                    <span className="dm-selected-file-icon">
                      <Icon name="file" size={14} />
                    </span>
                    <span className="dm-selected-file-copy">
                      <strong>{file.name}</strong>
                      <small>{formatAttachmentSize(file.size)}</small>
                    </span>
                    <button
                      type="button"
                      aria-label={`Retirer ${file.name}`}
                      onClick={() => handleRemoveSelectedFile(index)}
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="dm-composer-footer">
              <div className="dm-composer-tools">
                <button
                  type="button"
                  aria-label="Joindre un fichier"
                  disabled={sendMessageMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon name="paperclip" size={16} />
                </button>
                <div className="dm-emoji-picker-host" ref={emojiPickerRef}>
                  <button
                    type="button"
                    aria-label="Emoji"
                    aria-haspopup="dialog"
                    aria-expanded={emojiPickerOpen}
                    onClick={() => setEmojiPickerOpen((current) => !current)}
                  >
                    <Icon name="smile" size={16} />
                  </button>

                  {emojiPickerOpen ? (
                    <div className="dm-emoji-picker-popover" role="dialog">
                      <Suspense
                        fallback={
                          <div className="dm-emoji-picker-loading">
                            Chargement...
                          </div>
                        }
                      >
                        <EmojiPicker
                          height={360}
                          lazyLoadEmojis
                          previewConfig={{ showPreview: false }}
                          searchPlaceHolder="Rechercher un emoji"
                          theme={"auto" as Theme}
                          width={320}
                          onEmojiClick={handleEmojiSelect}
                        />
                      </Suspense>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="dm-send-area">
                <span>Entree pour envoyer</span>
                <button
                  type="submit"
                  disabled={!canSend}
                  aria-label="Envoyer"
                >
                  <Icon name="send" size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
