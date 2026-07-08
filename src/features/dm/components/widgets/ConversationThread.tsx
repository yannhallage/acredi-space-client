import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { EmojiClickData } from "emoji-picker-react";

import { useSendMessageMutation } from "../../../../shared/api/dm/hooks";
import type { MessageResponse } from "../../../../shared/api/dm/types";
import { resolveAssetUrl } from "../../../../shared/api/http";
import { useAuth } from "../../../../shared/context";
import type { Presence } from "../../../../shared/types";
import { Icon } from "../../../../shared/ui";

import { DmConversationThreadLoadingSkeleton } from "../skeletons/DmSkeletons";
import {
  createPendingAttachments,
  groupMessagesByDay,
  isSameSelectedFile,
  messageMatchesPending,
  type LocalMessage,
} from "../utils/dmMessageFormat";
import { AvatarPreviewOverlay } from "./AvatarPreviewOverlay";
import { ConversationComposer } from "./ConversationComposer";
import { ConversationHeader } from "./ConversationHeader";
import { ConversationMessageList } from "./ConversationMessageList";

const SCROLL_BOTTOM_THRESHOLD = 120;

interface DirectConversationThreadProps {
  channelId: string;
  title: string;
  subtitle?: string;
  presence?: Presence;
  avatarUrl?: string | null;
  messages: MessageResponse[];
  loading?: boolean;
  refreshing?: boolean;
  showBackButton?: boolean;
  onRefresh?: () => void;
  onClose?: () => void;

  selectedMessages: MessageResponse[];
  currentUserId: string;
  onToggleMessageSelection: (message: MessageResponse) => void;
  onClearMessageSelection: () => void;
  onForwardSelectedMessages: () => void;
  onEditSelectedMessage: () => void;
  onDeleteSelectedMessages: () => void;
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
  showBackButton = false,
  onRefresh,
  onClose,
  selectedMessages,
  currentUserId,
  onToggleMessageSelection,
  onClearMessageSelection,
  onForwardSelectedMessages,
  onEditSelectedMessage,
  onDeleteSelectedMessages,
}: DirectConversationThreadProps) {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showScrollAnchor, setShowScrollAnchor] = useState(false);

  const sendMessageMutation = useSendMessageMutation();

  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousChannelIdRef = useRef<string | null>(null);

  const messageGroups = useMemo(
    () => groupMessagesByDay(localMessages),
    [localMessages]
  );

  const canPreviewAvatar = Boolean(resolveAssetUrl(avatarUrl));

  const canSend =
    (Boolean(content.trim()) || selectedFiles.length > 0) &&
    !sendMessageMutation.isPending;

  const hasSelectedMessages = selectedMessages.length > 0;

  const canEditSelectedMessage =
  selectedMessages.length === 1 &&
  selectedMessages[0]?.senderId === currentUserId &&
  !selectedMessages[0]?.deleted;

  const canDeleteSelectedMessages =
  selectedMessages.length > 0 &&
  selectedMessages.every(
    (message) => message.senderId === currentUserId && !message.deleted
  );
  const selectedMessageIds = selectedMessages.map((message) => message.id);

  const getBottomDistance = useCallback((list: HTMLDivElement) => {
    return Math.max(0, list.scrollHeight - list.scrollTop - list.clientHeight);
  }, []);

  const syncScrollAnchorVisibility = useCallback(() => {
    const list = messageListRef.current;

    if (!list) return;

    const isAwayFromBottom = getBottomDistance(list) > SCROLL_BOTTOM_THRESHOLD;
    shouldStickToBottomRef.current = !isAwayFromBottom;
    setShowScrollAnchor(isAwayFromBottom);
  }, [getBottomDistance]);

  const scrollMessageListToBottom = useCallback(
    (behavior: ScrollBehavior = "auto") => {
      const list = messageListRef.current;

      if (!list) return;

      list.scrollTo({
        top: list.scrollHeight,
        behavior,
      });

      shouldStickToBottomRef.current = true;
      setShowScrollAnchor(false);
    },
    []
  );

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

    const channelChanged = previousChannelIdRef.current !== channelId;
    previousChannelIdRef.current = channelId;

    if (channelChanged || shouldStickToBottomRef.current) {
      const frameId = window.requestAnimationFrame(() => {
        scrollMessageListToBottom();
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    syncScrollAnchorVisibility();
  }, [
    channelId,
    localMessages,
    scrollMessageListToBottom,
    syncScrollAnchorVisibility,
  ]);

  useEffect(() => {
    const list = messageListRef.current;

    if (!list || loading) return;

    syncScrollAnchorVisibility();

    list.addEventListener("scroll", syncScrollAnchorVisibility, {
      passive: true,
    });

    return () => {
      list.removeEventListener("scroll", syncScrollAnchorVisibility);
    };
  }, [channelId, loading, syncScrollAnchorVisibility]);

  useEffect(() => {
    setAvatarPreviewOpen(false);
  }, [channelId]);

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
function handleToggleMessageSelection(message: LocalMessage) {
  if (message.pending || message.failed || message.deleted) {
    return;
  }

  onToggleMessageSelection(message as MessageResponse);
}

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
  editedAt: null,
  deletedAt: null,
  deletedById: null,
  deleted: false,
  attachments: createPendingAttachments(files),
  pending: true,
};

    shouldStickToBottomRef.current = true;

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

  function handleScrollToLatest() {
    scrollMessageListToBottom();
  }

  if (loading) {
    return <DmConversationThreadLoadingSkeleton />;
  }

  return (
    <section className="dm-thread">
      <div className="dm-thread-main">
        {hasSelectedMessages ? (
          <div className="dm-selection-header">
            <div className="dm-selection-header-left">
              <button
                className="icon-button"
                type="button"
                aria-label="Annuler la sélection"
                onClick={onClearMessageSelection}
              >
                ✕
              </button>

              <span>
                <strong>
                  {selectedMessages.length} message
                  {selectedMessages.length > 1 ? "s" : ""} sélectionné
                  {selectedMessages.length > 1 ? "s" : ""}
                </strong>
              </span>
            </div>

            <div className="dm-selection-header-actions">
              <button
                className="icon-button"
                type="button"
                aria-label="Transférer"
                title="Transférer"
                onClick={onForwardSelectedMessages}
              >
                ↗
              </button>

              {canEditSelectedMessage ? (
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Modifier"
                  title="Modifier"
                  onClick={onEditSelectedMessage}
                >
                  ✎
                </button>
              ) : null}

             {canDeleteSelectedMessages ? (
  <button
    className="icon-button"
    type="button"
    aria-label="Supprimer"
    title="Supprimer"
    onClick={onDeleteSelectedMessages}
  >
    🗑
  </button>
) : null}
            </div>
          </div>
        ) : (
          <ConversationHeader
            title={title}
            subtitle={subtitle}
            presence={presence}
            avatarUrl={avatarUrl}
            canPreviewAvatar={canPreviewAvatar}
            refreshing={refreshing}
            showBackButton={showBackButton}
            onAvatarPreview={() => setAvatarPreviewOpen(true)}
            onRefresh={onRefresh}
            onClose={onClose}
          />
        )}

        <div className="dm-thread-body-shell">
          <ConversationMessageList
            title={title}
            presence={presence}
            avatarUrl={avatarUrl}
            messageGroups={messageGroups}
            messageListRef={messageListRef}
            currentUserId={currentUserId}
            currentUserName={user?.name}
            currentUserAvatarUrl={user?.avatarUrl}
            selectedMessageIds={selectedMessageIds}
            onToggleMessageSelection={handleToggleMessageSelection}
          />

          <button
            className={`dm-scroll-bottom-anchor ${
              showScrollAnchor ? "visible" : ""
            }`}
            type="button"
            aria-hidden={!showScrollAnchor}
            aria-label="Aller aux derniers messages"
            disabled={!showScrollAnchor}
            title="Aller en bas"
            onClick={handleScrollToLatest}
          >
            <Icon name="chevDown" size={20} strokeWidth={2} />
          </button>
        </div>

        <ConversationComposer
          title={title}
          content={content}
          selectedFiles={selectedFiles}
          canSend={canSend}
          isSending={sendMessageMutation.isPending}
          emojiPickerOpen={emojiPickerOpen}
          textareaRef={textareaRef}
          fileInputRef={fileInputRef}
          emojiPickerRef={emojiPickerRef}
          onContentChange={setContent}
          onSubmit={handleSubmit}
          onFileInputChange={handleFileInputChange}
          onRemoveSelectedFile={handleRemoveSelectedFile}
          onToggleEmojiPicker={() => setEmojiPickerOpen((current) => !current)}
          onEmojiSelect={handleEmojiSelect}
        />
      </div>

      <AvatarPreviewOverlay
        name={title}
        open={avatarPreviewOpen}
        presence={presence}
        src={avatarUrl}
        onClose={() => setAvatarPreviewOpen(false)}
      />
    </section>
  );
}