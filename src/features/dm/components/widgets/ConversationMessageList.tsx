import { useEffect, useState, type MouseEvent, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  DeleteMessageConfirmModal,
  MessageActionsMenu,
  MessageShareModal,
  type MessageAction,
  type MessageMenuAnchor,
  type MessageShareTarget,
} from "../../../../shared/components/messaging";
import { loadAssetUrl, type LoadedAssetUrl } from "../../../../shared/api/http";
import { useShareMessageMutation } from "../../../../shared/api/dm/hooks";
import { discussionService } from "../../../../shared/api/discussions/service";
import { useMyTeamsQuery } from "../../../../shared/api/teams";
import { useUsersQuery } from "../../../../shared/api/users";
import type { Presence } from "../../../../shared/types";
import {
  downloadFileById,
  downloadFileFromUrl,
} from "../../../../shared/utils/downloadFile";
import { LinkifiedText } from "../../../../shared/utils/linkifyMessage";
import { Avatar, Icon } from "../../../../shared/ui";

import {
  formatAttachmentSize,
  formatTime,
  getAttachmentExtension,
  type LocalAttachment,
  type LocalMessage,
} from "../utils/dmMessageFormat";

const INLINE_IMAGE_MAX_BYTES = 25 * 1024 * 1024;
const INLINE_IMAGE_EXTENSIONS = new Set([
  "gif",
  "jpeg",
  "jpg",
  "png",
  "webp",
  "bmp",
  "svg",
  "avif",
]);

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="dm-date-separator">
      <span />
      <p>{label}</p>
      <span />
    </div>
  );
}

function MessageStatusTicks({
  failed,
  pending,
}: {
  failed?: boolean;
  pending?: boolean;
}) {
  if (failed) {
    return (
      <span className="dm-msg-ticks is-failed" aria-label="Echec d'envoi" title="Echec d'envoi">
        <Icon name="alert" size={12} strokeWidth={2} />
      </span>
    );
  }

  if (pending) {
    return (
      <span className="dm-msg-ticks is-pending" aria-label="Envoi en cours" title="Envoi...">
        <Icon name="clock" size={12} strokeWidth={2} />
      </span>
    );
  }

  return (
    <span className="dm-msg-ticks is-sent" aria-label="Envoye" title="Envoye">
      <svg
        aria-hidden="true"
        className="dm-msg-ticks-svg"
        viewBox="0 0 16 11"
        width="16"
        height="11"
        fill="none"
      >
        <path
          d="M11.07 1.05 5.2 8.3 1.9 5.1"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.8 1.05 8.93 8.3 7.4 6.85"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function getAttachmentImageExtension(attachment: LocalAttachment) {
  const nameExtension = attachment.name.includes(".")
    ? attachment.name.split(".").pop()?.toLowerCase()
    : undefined;
  const contentType = attachment.contentType?.toLowerCase().split(";")[0] ?? "";
  const mimeExtension = contentType.startsWith("image/")
    ? contentType.slice("image/".length).replace("svg+xml", "svg")
    : undefined;

  return nameExtension || mimeExtension || "";
}

function canPreviewAttachmentImage(attachment: LocalAttachment) {
  if (!attachment.downloadUrl) {
    return false;
  }

  if (
    Number.isFinite(attachment.sizeBytes) &&
    attachment.sizeBytes > INLINE_IMAGE_MAX_BYTES
  ) {
    return false;
  }

  const contentType = attachment.contentType?.toLowerCase().split(";")[0] ?? "";
  if (contentType.startsWith("image/")) {
    return true;
  }

  const extension = getAttachmentImageExtension(attachment);
  return INLINE_IMAGE_EXTENSIONS.has(extension);
}

function useAttachmentDownload(attachment: LocalAttachment) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function downloadAttachment() {
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

  return {
    downloadAttachment,
    downloadError,
    downloading,
  };
}

function MessageAttachmentFileItem({
  attachment,
}: {
  attachment: LocalAttachment;
}) {
  const { downloadAttachment, downloadError, downloading } =
    useAttachmentDownload(attachment);

  const meta = `${getAttachmentExtension(attachment)} - ${formatAttachmentSize(
    attachment.sizeBytes
  )}`;

  return (
    <>
      <button
        className="dm-attachment-item"
        type="button"
        disabled={attachment.pending || downloading}
        onClick={() => {
          void downloadAttachment();
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

function MessageImagePreviewDialog({
  attachment,
  onClose,
}: {
  attachment: LocalAttachment;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<LoadedAssetUrl | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { downloadAttachment, downloadError, downloading } =
    useAttachmentDownload(attachment);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    let active = true;
    let loadedPreview: LoadedAssetUrl | null = null;

    setPreview(null);
    setPreviewFailed(false);
    setImageLoaded(false);

    const downloadUrl = attachment.downloadUrl;

    if (!downloadUrl) {
      setPreviewFailed(true);
      return;
    }

    if (
      downloadUrl.startsWith("blob:") ||
      downloadUrl.startsWith("data:")
    ) {
      setPreview({ url: downloadUrl });
      return;
    }

    loadAssetUrl(downloadUrl)
      .then((asset) => {
        if (!active) {
          asset?.revoke?.();
          return;
        }

        if (!asset) {
          setPreviewFailed(true);
          return;
        }

        loadedPreview = asset;
        setPreview(asset);
      })
      .catch(() => {
        if (active) {
          setPreviewFailed(true);
        }
      });

    return () => {
      active = false;
      loadedPreview?.revoke?.();
    };
  }, [attachment.downloadUrl]);

  return (
    <motion.div
      className="dm-message-image-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Apercu de ${attachment.name}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClose}
    >
      <motion.div
        className="dm-message-image-preview-stage"
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }}
        transition={{
          type: "spring",
          stiffness: 360,
          damping: 32,
          mass: 0.9,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dm-message-image-preview-frame">
          <button
            className="dm-message-image-preview-download"
            type="button"
            aria-label={`Telecharger ${attachment.name}`}
            disabled={downloading}
            onClick={() => {
              void downloadAttachment();
            }}
          >
            <Icon name="download" size={16} />
          </button>

          {previewFailed ? (
            <div className="dm-message-image-preview-empty">
              <Icon name="alert" size={32} />
              <strong>Apercu indisponible</strong>
              <span>Tu peux toujours telecharger l'image.</span>
            </div>
          ) : null}

          {!previewFailed && !imageLoaded ? (
            <span
              className="dm-message-image-preview-loading"
              aria-hidden="true"
            />
          ) : null}

          {!previewFailed && preview ? (
            <motion.img
              alt={attachment.name}
              decoding="async"
              src={preview.url}
              style={{ opacity: imageLoaded ? 1 : 0 }}
              initial={{ scale: 1.02 }}
              animate={{ scale: imageLoaded ? 1 : 1.02 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              onError={() => setPreviewFailed(true)}
              onLoad={() => setImageLoaded(true)}
            />
          ) : null}

          {downloading ? (
            <span className="dm-message-image-preview-status">
              Telechargement...
            </span>
          ) : null}
        </div>

        <p className="dm-message-image-preview-name">{attachment.name}</p>
        {downloadError ? (
          <small className="dm-attachment-error">{downloadError}</small>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

function MessageImagePreviewOverlay({
  attachment,
  onClose,
}: {
  attachment: LocalAttachment | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {attachment ? (
        <MessageImagePreviewDialog
          key={attachment.id}
          attachment={attachment}
          onClose={onClose}
        />
      ) : null}
    </AnimatePresence>
  );
}

function MessageAttachmentImageItem({
  attachment,
  onPreview,
}: {
  attachment: LocalAttachment;
  onPreview: (attachment: LocalAttachment) => void;
}) {
  const [preview, setPreview] = useState<LoadedAssetUrl | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { downloadAttachment, downloadError, downloading } =
    useAttachmentDownload(attachment);

  useEffect(() => {
    let active = true;
    let loadedPreview: LoadedAssetUrl | null = null;

    setPreview(null);
    setPreviewFailed(false);
    setImageLoaded(false);

    const downloadUrl = attachment.downloadUrl;

    if (!downloadUrl) {
      setPreviewFailed(true);
      return;
    }

    if (
      downloadUrl.startsWith("blob:") ||
      downloadUrl.startsWith("data:")
    ) {
      setPreview({ url: downloadUrl });
      return;
    }

    loadAssetUrl(downloadUrl)
      .then((asset) => {
        if (!active) {
          asset?.revoke?.();
          return;
        }

        if (!asset) {
          setPreviewFailed(true);
          return;
        }

        loadedPreview = asset;
        setPreview(asset);
      })
      .catch(() => {
        if (active) {
          setPreviewFailed(true);
        }
      });

    return () => {
      active = false;
      loadedPreview?.revoke?.();
    };
  }, [attachment.downloadUrl]);

  if (previewFailed) {
    return <MessageAttachmentFileItem attachment={attachment} />;
  }

  return (
    <>
      <div
        className={`dm-image-attachment ${imageLoaded ? "loaded" : ""}${
          attachment.pending ? " is-pending" : ""
        }`}
        title={attachment.name}
      >
        <button
          className="dm-image-attachment-preview"
          type="button"
          aria-label={`Voir ${attachment.name}`}
          disabled={!preview || attachment.pending}
          onClick={() => onPreview(attachment)}
        >
          {!imageLoaded ? (
            <span className="dm-image-attachment-loading" aria-hidden="true" />
          ) : null}
          {preview ? (
            <img
              alt={attachment.name}
              decoding="async"
              loading="lazy"
              src={preview.url}
              onError={() => setPreviewFailed(true)}
              onLoad={() => setImageLoaded(true)}
            />
          ) : null}
        </button>

        {!attachment.pending ? (
          <button
            className="dm-image-attachment-download"
            type="button"
            aria-label={`Telecharger ${attachment.name}`}
            disabled={downloading}
            onClick={() => {
              void downloadAttachment();
            }}
          >
            <Icon name="download" size={14} />
          </button>
        ) : null}

        {attachment.pending ? null : downloading ? (
          <span className="dm-image-attachment-status">
            Telechargement...
          </span>
        ) : null}
      </div>
      {downloadError ? (
        <small className="dm-attachment-error">{downloadError}</small>
      ) : null}
    </>
  );
}

function MessageAttachmentItem({
  attachment,
  onPreviewImage,
}: {
  attachment: LocalAttachment;
  onPreviewImage: (attachment: LocalAttachment) => void;
}) {
  if (canPreviewAttachmentImage(attachment)) {
    return (
      <MessageAttachmentImageItem
        attachment={attachment}
        onPreview={onPreviewImage}
      />
    );
  }

  return <MessageAttachmentFileItem attachment={attachment} />;
}

function MessageAttachmentList({
  attachments,
  onPreviewImage,
}: {
  attachments: LocalAttachment[];
  onPreviewImage: (attachment: LocalAttachment) => void;
}) {
  if (!attachments.length) {
    return null;
  }

  const hasInlineImage = attachments.some(canPreviewAttachmentImage);

  return (
    <div
      className={`dm-attachment-list ${hasInlineImage ? "has-inline-image" : ""}`}
    >
      {attachments.map((attachment) => (
        <MessageAttachmentItem
          key={attachment.id}
          attachment={attachment}
          onPreviewImage={onPreviewImage}
        />
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
  showAvatar,
  isFirstInGroup,
  menuOpen,
  menuAnchor,
  onPreviewImage,
  onOpenMenu,
  onCloseMenu,
  onAction,
}: {
  message: LocalMessage;
  isMine: boolean;
  senderLabel: string;
  presence?: Presence;
  avatarSrc?: string | null;
  showAvatar: boolean;
  isFirstInGroup: boolean;
  menuOpen: boolean;
  menuAnchor: MessageMenuAnchor | null;
  onPreviewImage: (attachment: LocalAttachment) => void;
  onOpenMenu: (anchor: MessageMenuAnchor) => void;
  onCloseMenu: () => void;
  onAction: (action: MessageAction) => void;
}) {
  const time = formatTime(message.createdAt);
  const isDeleted = Boolean(message.deletedAt);
  const attachments = message.attachments ?? [];
  const hasContent = Boolean(message.content?.trim());
  const hasImages = attachments.some(canPreviewAttachmentImage);
  const mediaOnly = hasImages && !hasContent && !isDeleted;
  const canAct = !isDeleted && !message.pending && !message.failed;
  const isShared = message.kind === "SHARED";

  function handleBubbleContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (!canAct) return;

    const target = event.target as HTMLElement;
    if (
      target.closest(
        "button, input, textarea, .dm-attachment-item, .dm-image-attachment",
      )
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onOpenMenu({ x: event.clientX, y: event.clientY });
  }

  return (
    <article
      className={[
        "dm-message-row",
        isMine ? "mine" : "",
        isFirstInGroup ? "is-first" : "is-grouped",
        showAvatar ? "has-avatar" : "no-avatar",
        mediaOnly ? "is-media-only" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!isMine ? (
        showAvatar ? (
          <Avatar
            name={senderLabel}
            presence={presence}
            size={32}
            src={avatarSrc}
          />
        ) : (
          <span className="dm-message-avatar-spacer" aria-hidden="true" />
        )
      ) : null}

      <div className="dm-message-content">
        <div className="message-actions-shell">
          <div
            className={[
              "dm-message-bubble",
              menuOpen ? "is-menu-open" : "",
              isDeleted ? "is-deleted" : "",
              mediaOnly ? "is-media" : "",
              message.failed ? "is-failed" : "",
              message.pending ? "is-pending" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onContextMenu={handleBubbleContextMenu}
          >
            {isDeleted ? (
              <p className="dm-message-deleted">Ce message a été supprimé</p>
            ) : (
              <>
                {isShared ? (
                  <div className="dm-message-shared">
                    <span className="dm-message-shared-label">
                      <Icon name="share" size={12} />
                      Message partagé
                    </span>
                  </div>
                ) : null}
                {hasContent ? (
                  <p className="dm-message-text">
                    <LinkifiedText
                      linkClassName="dm-message-link"
                      text={message.content}
                    />
                  </p>
                ) : null}
                <MessageAttachmentList
                  attachments={attachments}
                  onPreviewImage={onPreviewImage}
                />
                {!hasContent && !attachments.length ? (
                  <p className="dm-message-text">
                    <LinkifiedText
                      linkClassName="dm-message-link"
                      text={message.content}
                    />
                  </p>
                ) : null}
              </>
            )}

            <div className="dm-message-meta-inline">
              {message.editedAt && !isDeleted ? (
                <span className="dm-message-edited">modifié</span>
              ) : null}
              {time ? <time dateTime={message.createdAt}>{time}</time> : null}
              {isMine ? (
                <MessageStatusTicks
                  failed={message.failed}
                  pending={message.pending}
                />
              ) : null}
            </div>
          </div>

          <MessageActionsMenu
            open={menuOpen}
            anchor={menuAnchor}
            canEdit={isMine && canAct}
            canDelete={isMine && canAct}
            onClose={onCloseMenu}
            onAction={onAction}
          />
        </div>
      </div>
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
  isTyping?: boolean;
  loadingOlder?: boolean;
  onEditMessage: (message: LocalMessage) => void;
  onDeleteMessage: (messageId: string) => void;
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
  isTyping = false,
  loadingOlder = false,
  onEditMessage,
  onDeleteMessage,
}: ConversationMessageListProps) {
  const [previewAttachment, setPreviewAttachment] =
    useState<LocalAttachment | null>(null);
  const [openMenuMessageId, setOpenMenuMessageId] = useState<string | null>(
    null,
  );
  const [menuAnchor, setMenuAnchor] = useState<MessageMenuAnchor | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<LocalMessage | null>(
    null,
  );
  const [messageToShare, setMessageToShare] = useState<LocalMessage | null>(
    null,
  );
  const [sharingTargetId, setSharingTargetId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const usersQuery = useUsersQuery({ enabled: Boolean(messageToShare) });
  const teamsQuery = useMyTeamsQuery({ enabled: Boolean(messageToShare) });
  const shareMessageMutation = useShareMessageMutation();

  const shareLoading = usersQuery.loading || teamsQuery.loading;
  const shareQueryError = usersQuery.error ?? teamsQuery.error;

  function handleAction(message: LocalMessage, action: MessageAction) {
    if (action === "copy") {
      const text = message.content?.trim() ?? "";
      if (text) {
        void navigator.clipboard.writeText(text).catch(() => undefined);
      }
      return;
    }

    if (action === "edit") {
      onEditMessage(message);
      return;
    }

    if (action === "delete") {
      setMessageToDelete(message);
      return;
    }

    setShareError(null);
    setMessageToShare(message);
  }

  function handleConfirmDelete() {
    if (!messageToDelete) return;
    onDeleteMessage(messageToDelete.id);
    setMessageToDelete(null);
  }

  async function handleShareSelect(target: MessageShareTarget) {
    if (!messageToShare || sharingTargetId) return;

    const targetId = target.type === "user" ? target.user.id : target.team.id;
    setSharingTargetId(targetId);
    setShareError(null);

    try {
      if (target.type === "user") {
        await shareMessageMutation.mutateAsync({
          messageId: messageToShare.id,
          request: { userId: target.user.id },
        });
      } else {
        const discussions = await discussionService.findByTeam(target.team.id);
        const discussion = discussions[0];

        if (!discussion) {
          throw new Error(
            "Cette equipe n'a pas encore de discussion de groupe.",
          );
        }

        await shareMessageMutation.mutateAsync({
          messageId: messageToShare.id,
          request: { discussionId: discussion.id },
        });
      }

      setMessageToShare(null);
    } catch (error) {
      setShareError(
        error instanceof Error
          ? error.message
          : "Impossible de partager ce message.",
      );
    } finally {
      setSharingTargetId(null);
    }
  }

  return (
    <>
      <main ref={messageListRef} className="dm-thread-body">
        {loadingOlder ? (
          <div className="dm-thread-older-loader">Chargement de l'historique...</div>
        ) : null}
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

              {group.items.map((message, index) => {
                const isMine = currentUserId === message.senderId;
                const previous = group.items[index - 1];
                const next = group.items[index + 1];
                const previousMine =
                  previous != null && currentUserId === previous.senderId;
                const nextMine =
                  next != null && currentUserId === next.senderId;
                const isFirstInGroup =
                  !previous || previousMine !== isMine;
                const isLastInGroup = !next || nextMine !== isMine;
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
                    showAvatar={!isMine && isLastInGroup}
                    isFirstInGroup={isFirstInGroup}
                    menuOpen={openMenuMessageId === message.id}
                    menuAnchor={
                      openMenuMessageId === message.id ? menuAnchor : null
                    }
                    onPreviewImage={setPreviewAttachment}
                    onOpenMenu={(anchor) => {
                      setMenuAnchor(anchor);
                      setOpenMenuMessageId(message.id);
                    }}
                    onCloseMenu={() => {
                      setOpenMenuMessageId(null);
                      setMenuAnchor(null);
                    }}
                    onAction={(action) => handleAction(message, action)}
                  />
                );
              })}
            </div>
          ))
        )}

        {isTyping ? (
          <article
            className="dm-message-row dm-typing-indicator is-first has-avatar"
            aria-live="polite"
            aria-label="En train d'ecrire"
          >
            <Avatar name={title} presence={presence} size={32} src={avatarUrl} />
            <div className="dm-message-content">
              <div className="dm-message-bubble dm-typing-bubble">
                <span className="typing-row-dots">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </div>
          </article>
        ) : null}
      </main>

      <MessageImagePreviewOverlay
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      <DeleteMessageConfirmModal
        open={Boolean(messageToDelete)}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <MessageShareModal
        open={Boolean(messageToShare)}
        loading={shareLoading}
        error={
          shareQueryError ??
          (shareError ? new Error(shareError) : null)
        }
        users={usersQuery.data ?? []}
        teams={teamsQuery.data ?? []}
        sharingTargetId={sharingTargetId}
        onClose={() => {
          if (sharingTargetId) return;
          setShareError(null);
          setMessageToShare(null);
        }}
        onRetry={() => {
          void usersQuery.refetch();
          void teamsQuery.refetch();
        }}
        onSelect={handleShareSelect}
      />
    </>
  );
}
