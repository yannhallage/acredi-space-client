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

import { useDeleteMessageMutation, useSendMessageMutation, useUpdateMessageMutation } from "../../../../shared/api/dm/hooks";
import type { ChannelTypingUser } from "../../../../shared/api/dm/useChannelMessagesSocket";
import type { MessageResponse } from "../../../../shared/api/dm/types";
import { resolveAssetUrl } from "../../../../shared/api/http";
import { useAuth } from "../../../../shared/context";
import type { Presence, User } from "../../../../shared/types";
import { Icon } from "../../../../shared/ui";

import { ContactDetailsModal } from "../modals/ContactDetailsModal";
import { DmConversationThreadLoadingSkeleton } from "../skeletons/DmSkeletons";
import {
  createPendingAttachments,
  groupMessagesByDay,
  isSameSelectedFile,
  messageMatchesPending,
  revokePendingAttachmentUrls,
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
  contact?: User | null;
  messages: MessageResponse[];
  loading?: boolean;
  refreshing?: boolean;
  showBackButton?: boolean;
  typingUsers?: ChannelTypingUser[];
  publishTyping?: (typing: boolean) => void;
  onRefresh?: () => void;
  onClose?: () => void;
}

export function DirectConversationThread({
  channelId,
  title,
  subtitle = "Message direct",
  presence = "offline",
  avatarUrl,
  contact = null,
  messages,
  loading = false,
  refreshing = false,
  showBackButton = false,
  typingUsers = [],
  publishTyping,
  onRefresh,
  onClose,
}: DirectConversationThreadProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showScrollAnchor, setShowScrollAnchor] = useState(false);
  const sendMessageMutation = useSendMessageMutation();
  const deleteMessageMutation = useDeleteMessageMutation();
  const updateMessageMutation = useUpdateMessageMutation();
  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousChannelIdRef = useRef<string | null>(null);
  const editedMessagesRef = useRef(new Map<string, string>());
  const lastTypingSentRef = useRef(false);
  const typingStopTimeoutRef = useRef<number | null>(null);

  const messageGroups = useMemo(
    () => groupMessagesByDay(localMessages),
    [localMessages]
  );
  const canPreviewAvatar = Boolean(resolveAssetUrl(avatarUrl));
  const isEditing = Boolean(editingMessageId);
  const canSend =
    (Boolean(content.trim()) || (!isEditing && selectedFiles.length > 0)) &&
    !sendMessageMutation.isPending;

  const isTyping = typingUsers.length > 0;

  const stopTypingSignal = useCallback(() => {
    if (typingStopTimeoutRef.current) {
      window.clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }

    if (lastTypingSentRef.current) {
      lastTypingSentRef.current = false;
      publishTyping?.(false);
    }
  }, [publishTyping]);

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);

      if (isEditing) {
        return;
      }

      if (value.trim()) {
        if (!lastTypingSentRef.current) {
          lastTypingSentRef.current = true;
          publishTyping?.(true);
        }

        if (typingStopTimeoutRef.current) {
          window.clearTimeout(typingStopTimeoutRef.current);
        }

        typingStopTimeoutRef.current = window.setTimeout(() => {
          stopTypingSignal();
        }, 2500);
      } else {
        stopTypingSignal();
      }
    },
    [isEditing, publishTyping, stopTypingSignal],
  );

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
        (pendingMessage) => {
          const matched = messages.some((message) =>
            messageMatchesPending(message, pendingMessage)
          );

          if (matched) {
            revokePendingAttachmentUrls(pendingMessage.attachments);
          }

          return !matched;
        }
      );

      const syncedMessages = messages.map((message) => {
          const editedContent = editedMessagesRef.current.get(message.id);
          return editedContent && !message.deletedAt
            ? { ...message, content: editedContent }
            : message;
        });

      return [...syncedMessages, ...pendingWithoutDuplicate];
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
    isTyping,
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
    setContactDetailsOpen(false);
    setEditingMessageId(null);
    editedMessagesRef.current.clear();
  }, [channelId]);

  useEffect(() => {
    stopTypingSignal();
    setContent("");
    setSelectedFiles([]);
    setEmojiPickerOpen(false);
    setEditingMessageId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [channelId, stopTypingSignal]);

  useEffect(() => {
    return () => {
      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current);
      }
    };
  }, []);

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

  function handleCancelEdit() {
    setEditingMessageId(null);
    setContent("");
  }

  function handleEditMessage(message: LocalMessage) {
    stopTypingSignal();
    setEditingMessageId(message.id);
    setContent(message.content ?? "");
    setSelectedFiles([]);
    setEmojiPickerOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function handleDeleteMessage(messageId: string) {
    editedMessagesRef.current.delete(messageId);

    if (editingMessageId === messageId) {
      handleCancelEdit();
    }

    const deletedAt = new Date().toISOString();

    setLocalMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? { ...message, content: "", attachments: [], deletedAt }
          : message,
      ),
    );

    if (messageId.startsWith("temp-") || messageId.startsWith("pending-")) {
      return;
    }

    deleteMessageMutation.mutate(messageId);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopTypingSignal();

    const value = content.trim();
    const files = [...selectedFiles];

    if (editingMessageId) {
      if (!value) {
        return;
      }

      const editedAt = new Date().toISOString();
      editedMessagesRef.current.set(editingMessageId, value);
      setLocalMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === editingMessageId
            ? { ...message, content: value, editedAt }
            : message
        )
      );

      const messageId = editingMessageId;
      setEditingMessageId(null);
      setContent("");

      if (!messageId.startsWith("temp-") && !messageId.startsWith("pending-")) {
        updateMessageMutation.mutate({ messageId, content: value });
      }

      return;
    }

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
            currentMessages.map((message) => {
              if (message.id !== temporaryId) {
                return message;
              }

              revokePendingAttachmentUrls(message.attachments);
              return savedMessage;
            })
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

    handleContentChange(nextContent);
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
        <ConversationHeader
          title={title}
          subtitle={subtitle}
          presence={presence}
          avatarUrl={avatarUrl}
          canPreviewAvatar={canPreviewAvatar}
          refreshing={refreshing}
          showBackButton={showBackButton}
          onAvatarPreview={() => setAvatarPreviewOpen(true)}
          onContactDetails={() => setContactDetailsOpen(true)}
          onRefresh={onRefresh}
          onClose={onClose}
        />

        <div className="dm-thread-body-shell">
          <ConversationMessageList
            title={title}
            presence={presence}
            avatarUrl={avatarUrl}
            messageGroups={messageGroups}
            messageListRef={messageListRef}
            currentUserId={user?.id}
            currentUserName={user?.name}
            currentUserAvatarUrl={user?.avatarUrl}
            isTyping={isTyping}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
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
          isEditing={isEditing}
          emojiPickerOpen={emojiPickerOpen}
          textareaRef={textareaRef}
          fileInputRef={fileInputRef}
          emojiPickerRef={emojiPickerRef}
          onContentChange={handleContentChange}
          onSubmit={handleSubmit}
          onFileInputChange={handleFileInputChange}
          onRemoveSelectedFile={handleRemoveSelectedFile}
          onToggleEmojiPicker={() => setEmojiPickerOpen((current) => !current)}
          onEmojiSelect={handleEmojiSelect}
          onCancelEdit={handleCancelEdit}
        />
      </div>

      <AvatarPreviewOverlay
        name={title}
        open={avatarPreviewOpen}
        presence={presence}
        src={avatarUrl}
        onClose={() => setAvatarPreviewOpen(false)}
      />

      <ContactDetailsModal
        open={contactDetailsOpen}
        contact={contact}
        fallbackName={title}
        fallbackPresence={presence}
        fallbackAvatarUrl={avatarUrl}
        fallbackRole={subtitle}
        onClose={() => setContactDetailsOpen(false)}
      />
    </section>
  );
}
