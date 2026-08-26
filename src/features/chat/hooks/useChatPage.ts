import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EmojiClickData } from "emoji-picker-react";

import {
  formatDiscussionMemberName,
  useDeleteDiscussionMessage,
  useDiscussion,
  useDiscussionMessages,
  useDiscussionMessagesSocket,
  useMyDiscussions,
  useSendDiscussionMessage,
  useUpdateDiscussionMessage,
} from "../../../shared/api/discussions";
import { fileService } from "../../../shared/api/files/service";
import { useUsersQuery } from "../../../shared/api/users";
import { useAuth } from "../../../shared/context";
import { getFriendlyErrorMessage } from "../../../shared/feedback";

import {
  filterMentionMembers,
  getMentionContext,
  insertMention,
  type MentionMemberOption,
} from "../components/widgets/MentionSuggestions";
import {
  buildMessageContentWithFile,
  groupMessagesByDay,
  parseMessageContent,
  type LocalGroupMessage,
} from "../utils/messageFormat";
import { useChatMobileLayout } from "./useChatMobileLayout";

const SCROLL_BOTTOM_THRESHOLD = 120;
const SCROLL_TOP_LOAD_THRESHOLD = 80;

export function useChatPage() {
  const { channelId: discussionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobileLayout = useChatMobileLayout();

  const usersQuery = useUsersQuery();

  const usersById = useMemo(() => {
    const map = new Map<string, { avatarUrl?: string | null }>();

    (usersQuery.data ?? []).forEach((member) => {
      map.set(member.id, member);
    });

    return map;
  }, [usersQuery.data]);

  const getUserAvatarUrl = (userId: string) => {
    if (user?.id === userId) {
      return user.avatarUrl;
    }

    return usersById.get(userId)?.avatarUrl;
  };

  const messageListRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const previousDiscussionIdRef = useRef<string | null>(null);
  const loadingOlderRef = useRef(false);
  const pendingScrollRestoreRef = useRef<{
    height: number;
    top: number;
  } | null>(null);

  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const editedMessagesRef = useRef(new Map<string, string>());

  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [temporaryMessages, setTemporaryMessages] = useState<
    LocalGroupMessage[]
  >([]);

  const [messageOverrides, setMessageOverrides] = useState<
    Record<string, LocalGroupMessage>
  >({});

  const {
    data: discussions = [],
    isLoading: discussionsLoading,
    isError: discussionsError,
    error: discussionsErrorDetails,
  } = useMyDiscussions();

  const activeDiscussion = useMemo(() => {
    if (!discussions.length) {
      return null;
    }

    if (discussionId) {
      return (
        discussions.find((discussion) => discussion.id === discussionId) ??
        (isMobileLayout ? null : discussions[0])
      );
    }

    if (isMobileLayout) {
      return null;
    }

    return discussions[0];
  }, [discussionId, discussions, isMobileLayout]);

  const {
    data: discussionDetail,
    isLoading: discussionDetailLoading,
  } = useDiscussion(activeDiscussion?.id, {
    enabled: Boolean(activeDiscussion?.id),
  });

  const members = discussionDetail?.members ?? activeDiscussion?.members ?? [];

  const mentionMembers = useMemo<MentionMemberOption[]>(() => {
    return members.map((member) => ({
      userId: member.userId,
      name: formatDiscussionMemberName(member),
      avatarUrl: getUserAvatarUrl(member.userId),
      isCurrentUser: user?.id === member.userId,
    }));
  }, [members, user?.id, usersById]);

  const filteredMentionMembers = useMemo(() => {
    if (mentionQuery === null) {
      return [];
    }

    return filterMentionMembers(mentionMembers, mentionQuery);
  }, [mentionMembers, mentionQuery]);

  const mentionDropdownOpen =
    mentionQuery !== null && filteredMentionMembers.length > 0;

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isFetching: messagesFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError: messagesError,
    error: messagesErrorDetails,
    refetch: refetchMessages,
  } = useDiscussionMessages(activeDiscussion?.id, {
    enabled: Boolean(activeDiscussion?.id),
  });

  const { typingUsers, publishTyping } = useDiscussionMessagesSocket(
    activeDiscussion?.id,
  );

  const sendMessage = useSendDiscussionMessage();
  const deleteMessage = useDeleteDiscussionMessage();
  const updateMessage = useUpdateDiscussionMessage();
  const lastTypingSentRef = useRef(false);
  const typingStopTimeoutRef = useRef<number | null>(null);

  function stopTypingSignal() {
    if (typingStopTimeoutRef.current) {
      window.clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }

    if (lastTypingSentRef.current) {
      lastTypingSentRef.current = false;
      publishTyping(false);
    }
  }

  useEffect(() => {
    return () => {
      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    stopTypingSignal();
  }, [activeDiscussion?.id]);

  function closeMentionSuggestions() {
    setMentionQuery(null);
    setMentionStart(null);
    setMentionActiveIndex(0);
  }

  useEffect(() => {
    closeMentionSuggestions();
    setTemporaryMessages([]);
  }, [activeDiscussion?.id]);

  const localMessages = useMemo(() => {
    const serverMessagesWithOverrides = messages.map((message) => {
      const override = messageOverrides[message.id];

      if (!override) {
        return message;
      }

      return {
        ...message,
        ...override,
        pending: false,
        failed: false,
      };
    });

    const pendingWithoutDuplicate = temporaryMessages.filter(
      (pendingMessage) =>
        !serverMessagesWithOverrides.some(
          (message) =>
            message.content === pendingMessage.content &&
            message.senderId === pendingMessage.senderId &&
            Math.abs(
              new Date(message.createdAt).getTime() -
                new Date(pendingMessage.createdAt).getTime()
            ) < 10000
        )
    );

    return [...serverMessagesWithOverrides, ...pendingWithoutDuplicate];
  }, [messages, temporaryMessages, messageOverrides]);

  useEffect(() => {
    closeMentionSuggestions();
    setEditingMessageId(null);
    setDraft("");
    setSelectedFile(null);
    setMessageOverrides({});
    editedMessagesRef.current.clear();
  }, [activeDiscussion?.id]);

  useEffect(() => {
    if (
      !discussionsLoading &&
      !isMobileLayout &&
      activeDiscussion &&
      discussionId !== activeDiscussion.id
    ) {
      navigate(`/app/chat/${activeDiscussion.id}`, { replace: true });
    }
  }, [
    activeDiscussion,
    discussionId,
    discussionsLoading,
    isMobileLayout,
    navigate,
  ]);

  function handleCloseDiscussion() {
    navigate("/app/chat");
  }

  useEffect(() => {
    const list = messageListRef.current;

    if (!list) {
      return;
    }

    const discussionChanged =
      previousDiscussionIdRef.current !== (activeDiscussion?.id ?? null);
    previousDiscussionIdRef.current = activeDiscussion?.id ?? null;

    if (pendingScrollRestoreRef.current) {
      return;
    }

    if (discussionChanged || shouldStickToBottomRef.current) {
      list.scrollTop = list.scrollHeight;
      shouldStickToBottomRef.current = true;
    }
  }, [localMessages, activeDiscussion?.id]);

  const loadOlderMessages = useCallback(() => {
    const list = messageListRef.current;

    if (
      !list ||
      !hasNextPage ||
      isFetchingNextPage ||
      loadingOlderRef.current
    ) {
      return;
    }

    loadingOlderRef.current = true;
    if (!shouldStickToBottomRef.current) {
      pendingScrollRestoreRef.current = {
        height: list.scrollHeight,
        top: list.scrollTop,
      };
    }

    void Promise.resolve(fetchNextPage()).finally(() => {
      loadingOlderRef.current = false;
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const list = messageListRef.current;

    if (!list || messagesLoading) {
      return;
    }

    function handleScroll() {
      const currentList = messageListRef.current;
      if (!currentList) {
        return;
      }

      const distanceFromBottom = Math.max(
        0,
        currentList.scrollHeight - currentList.scrollTop - currentList.clientHeight,
      );
      shouldStickToBottomRef.current =
        distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;

      if (currentList.scrollTop <= SCROLL_TOP_LOAD_THRESHOLD) {
        loadOlderMessages();
      }
    }

    handleScroll();
    list.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      list.removeEventListener("scroll", handleScroll);
    };
  }, [activeDiscussion?.id, loadOlderMessages, messagesLoading]);

  useEffect(() => {
    const list = messageListRef.current;

    if (!list || messagesLoading || !hasNextPage || isFetchingNextPage) {
      return;
    }

    if (list.scrollHeight <= list.clientHeight + SCROLL_TOP_LOAD_THRESHOLD) {
      loadOlderMessages();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    loadOlderMessages,
    localMessages.length,
    messagesLoading,
  ]);

  useEffect(() => {
    const pending = pendingScrollRestoreRef.current;
    const list = messageListRef.current;

    if (!pending || !list || isFetchingNextPage) {
      return;
    }

    list.scrollTop = pending.top + (list.scrollHeight - pending.height);
    pendingScrollRestoreRef.current = null;
  }, [isFetchingNextPage, localMessages]);

  useEffect(() => {
    pendingScrollRestoreRef.current = null;
    loadingOlderRef.current = false;
    shouldStickToBottomRef.current = true;
  }, [activeDiscussion?.id]);

  const messageGroups = useMemo(
    () => groupMessagesByDay(localMessages),
    [localMessages]
  );

  function handleEmojiClick(emojiData: EmojiClickData) {
    setDraft((currentDraft) => currentDraft + emojiData.emoji);
    setEmojiOpen(false);
  }

  function syncMentionContext(value: string, cursor: number) {
    const context = getMentionContext(value, cursor);

    if (context) {
      setMentionQuery(context.query);
      setMentionStart(context.start);
      setMentionActiveIndex(0);
      return;
    }

    closeMentionSuggestions();
  }

  function handleDraftChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const { value, selectionStart } = event.target;

    setDraft(value);
    syncMentionContext(value, selectionStart);

    if (value.trim()) {
      if (!lastTypingSentRef.current) {
        lastTypingSentRef.current = true;
        publishTyping(true);
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
  }

  function selectMentionMember(member: MentionMemberOption) {
    if (mentionStart === null) {
      return;
    }

    const cursor = textareaRef.current?.selectionStart ?? draft.length;

    const { nextValue, nextCursor } = insertMention(
      draft,
      mentionStart,
      cursor,
      member.name
    );

    setDraft(nextValue);
    closeMentionSuggestions();

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;

      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    event.currentTarget.value = "";
  }

  function removeSelectedFile() {
    setSelectedFile(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    stopTypingSignal();

    const content = draft.trim();
    const fileToSend = selectedFile;

    if (editingMessageId) {
      if (!content) {
        return;
      }

      const currentMessage = localMessages.find(
        (message) => message.id === editingMessageId,
      );
      const { attachment } = parseMessageContent(currentMessage?.content ?? "");
      const nextContent = attachment
        ? buildMessageContentWithFile(content, attachment)
        : content;
      const editedAt = new Date().toISOString();

      editedMessagesRef.current.set(editingMessageId, nextContent);
      setMessageOverrides((currentOverrides) => ({
        ...currentOverrides,
        [editingMessageId]: {
          ...(currentMessage ?? currentOverrides[editingMessageId]),
          id: editingMessageId,
          content: nextContent,
          editedAt,
          pending: false,
          failed: false,
        } as LocalGroupMessage,
      }));

      const messageId = editingMessageId;
      setEditingMessageId(null);
      setDraft("");
      closeMentionSuggestions();

      if (activeDiscussion?.id && !messageId.startsWith("temp-")) {
        updateMessage.mutate({
          discussionId: activeDiscussion.id,
          messageId,
          content: nextContent,
        });
      }

      return;
    }

    if ((!content && !fileToSend) || !activeDiscussion || !user?.id) {
      return;
    }

    if (sendMessage.isPending || uploadingFile) {
      return;
    }

    const temporaryId = `temp-${activeDiscussion.id}-${Date.now()}`;

    const temporaryContent = fileToSend
      ? buildMessageContentWithFile(content, {
          id: null,
          name: fileToSend.name,
          size: fileToSend.size,
          contentType: fileToSend.type,
        })
      : content;

    const temporaryMessage: LocalGroupMessage = {
      id: temporaryId,
      discussionId: activeDiscussion.id,
      senderId: user.id,
      senderName: user.name || "Vous",
      content: temporaryContent,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
      deletedById: null,
      deleted: false,
      pending: true,
    };

    setTemporaryMessages((currentMessages) => [
      ...currentMessages,
      temporaryMessage,
    ]);

    setDraft("");
    setSelectedFile(null);
    closeMentionSuggestions();

    try {
      let finalContent = content;

      if (fileToSend) {
        setUploadingFile(true);

        const uploadedFile = await fileService.upload({
          file: fileToSend,
          teamId: activeDiscussion.teamId ?? null,
          visibility: activeDiscussion.teamId ? "TEAM" : "PRIVATE",
        });

        finalContent = buildMessageContentWithFile(content, {
          id: uploadedFile.id,
          name: uploadedFile.name || fileToSend.name,
          size: uploadedFile.size ?? fileToSend.size,
          contentType: uploadedFile.contentType ?? fileToSend.type,
        });
      }

      await sendMessage.mutateAsync({
        discussionId: activeDiscussion.id,
        request: {
          content: finalContent,
        },
      });

      setTemporaryMessages((currentMessages) =>
        currentMessages.filter((message) => message.id !== temporaryId)
      );
    } catch {
      setTemporaryMessages((currentMessages) =>
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
    } finally {
      setUploadingFile(false);
    }
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setDraft("");
  }

  function handleEditMessage(message: LocalGroupMessage) {
    const { text } = parseMessageContent(message.content);

    setEditingMessageId(message.id);
    setDraft(text);
    setSelectedFile(null);
    setEmojiOpen(false);
    closeMentionSuggestions();

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
    const currentMessage = localMessages.find(
      (message) => message.id === messageId,
    );

    setMessageOverrides((currentOverrides) => ({
      ...currentOverrides,
      [messageId]: {
        ...(currentMessage ?? currentOverrides[messageId]),
        id: messageId,
        content: "",
        deletedAt,
        pending: false,
        failed: false,
      } as LocalGroupMessage,
    }));

    if (!activeDiscussion?.id || messageId.startsWith("temp-")) {
      return;
    }

    deleteMessage.mutate({
      discussionId: activeDiscussion.id,
      messageId,
    });
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionDropdownOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault();

        setMentionActiveIndex(
          (currentIndex) =>
            (currentIndex + 1) % filteredMentionMembers.length
        );

        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();

        setMentionActiveIndex(
          (currentIndex) =>
            (currentIndex - 1 + filteredMentionMembers.length) %
            filteredMentionMembers.length
        );

        return;
      }

      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();

        const selectedMember =
          filteredMentionMembers[mentionActiveIndex] ??
          filteredMentionMembers[0];

        if (selectedMember) {
          selectMentionMember(selectedMember);
        }

        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeMentionSuggestions();
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function replaceLocalMessage(updatedMessage: LocalGroupMessage) {
    setMessageOverrides((currentOverrides) => ({
      ...currentOverrides,
      [updatedMessage.id]: {
        ...updatedMessage,
        pending: false,
        failed: false,
      },
    }));

    setTemporaryMessages((currentMessages) =>
      currentMessages.filter((message) => message.id !== updatedMessage.id)
    );
  }

  const sendError = sendMessage.error
    ? getFriendlyErrorMessage(sendMessage.error, "Impossible d'envoyer le message.")
    : null;

  const discussionName = discussionDetail?.name ?? activeDiscussion?.name ?? "";
  const teamName = discussionDetail?.teamName ?? activeDiscussion?.teamName;

  const typingLabel = useMemo(() => {
    if (!typingUsers.length) {
      return null;
    }

    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} est en train d'ecrire…`;
    }

    if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} et ${typingUsers[1].userName} ecrivent…`;
    }

    return `${typingUsers.length} personnes ecrivent…`;
  }, [typingUsers]);

  return {
    isMobileLayout,
    discussions,
    discussionsLoading,
    discussionsError,
    discussionsErrorDetails,
    activeDiscussion,
    discussionDetail,
    discussionDetailLoading,
    discussionName,
    teamName,
    members,
    messagesLoading,
    messagesError,
    messagesErrorDetails,
    messagesFetching: messagesFetching && !isFetchingNextPage,
    hasMore: Boolean(hasNextPage),
    loadingOlder: isFetchingNextPage,
    onLoadOlder: loadOlderMessages,
    messageGroups,
    messageListRef,
    getUserAvatarUrl,
    currentUserId: user?.id,

    refetchMessages,
    replaceLocalMessage,

    draft,
    selectedFile,
    emojiOpen,
    uploadingFile,
    sendError,
    sendPending: sendMessage.isPending,
    mentionActiveIndex,
    filteredMentionMembers,
    mentionDropdownOpen,
    textareaRef,
    fileInputRef,
    handleSubmit,
    handleDraftChange,
    handleComposerKeyDown,
    syncMentionContext,
    setMentionActiveIndex,
    selectMentionMember,
    handleEmojiClick,
    toggleEmoji: () => setEmojiOpen((value) => !value),
    handlePickFile,
    handleFileChange,
    removeSelectedFile,
    isEditing: Boolean(editingMessageId),
    handleEditMessage,
    handleDeleteMessage,
    handleCancelEdit,
    handleCloseDiscussion,
    typingUsers,
    typingLabel,
  };
}