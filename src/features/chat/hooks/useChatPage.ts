import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EmojiClickData } from "emoji-picker-react";

import {
  formatDiscussionMemberName,
  useDiscussion,
  useDiscussionMessages,
  useMyDiscussions,
  useSendDiscussionMessage,
} from "../../../shared/api/discussions";
import { fileService } from "../../../shared/api/files/service";
import { useUsersQuery } from "../../../shared/api/users";
import { useAuth } from "../../../shared/context";

import {
  filterMentionMembers,
  getMentionContext,
  insertMention,
  type MentionMemberOption,
} from "../components/widgets/MentionSuggestions";
import {
  buildMessageContentWithFile,
  groupMessagesByDay,
  type LocalGroupMessage,
} from "../utils/messageFormat";

export function useChatPage() {
  const { channelId: discussionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const [draft, setDraft] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);

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

    return (
      discussions.find((discussion) => discussion.id === discussionId) ??
      discussions[0]
    );
  }, [discussionId, discussions]);

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
    isError: messagesError,
    error: messagesErrorDetails,
    refetch: refetchMessages,
  } = useDiscussionMessages(activeDiscussion?.id, {
    enabled: Boolean(activeDiscussion?.id),
  });

  const sendMessage = useSendDiscussionMessage();

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
    if (
      !discussionsLoading &&
      activeDiscussion &&
      discussionId !== activeDiscussion.id
    ) {
      navigate(`/app/chat/${activeDiscussion.id}`, { replace: true });
    }
  }, [activeDiscussion, discussionId, discussionsLoading, navigate]);

  useEffect(() => {
    const list = messageListRef.current;

    if (!list) {
      return;
    }

    list.scrollTop = list.scrollHeight;
  }, [localMessages, activeDiscussion?.id]);

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

    const content = draft.trim();
    const fileToSend = selectedFile;

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

  const sendError =
    sendMessage.error instanceof Error ? sendMessage.error.message : null;

  const discussionName = discussionDetail?.name ?? activeDiscussion?.name ?? "";
  const teamName = discussionDetail?.teamName ?? activeDiscussion?.teamName;

  return {
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
    messagesFetching,
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
  };
}