import {
  ChangeEvent,
  FormEvent,
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
  const [avatarPreviewOpen, setAvatarPreviewOpen] = useState(false);
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
  const canPreviewAvatar = Boolean(resolveAssetUrl(avatarUrl));
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
          onAvatarPreview={() => setAvatarPreviewOpen(true)}
          onRefresh={onRefresh}
          onClose={onClose}
        />

        <ConversationMessageList
          title={title}
          presence={presence}
          avatarUrl={avatarUrl}
          messageGroups={messageGroups}
          messageListRef={messageListRef}
          currentUserId={user?.id}
          currentUserName={user?.name}
          currentUserAvatarUrl={user?.avatarUrl}
        />

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
