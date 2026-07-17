import { useState, type ReactNode, type RefObject } from "react";

import {
  DeleteMessageConfirmModal,
  MessageShareModal,
  type MessageAction,
  type MessageMenuAnchor,
} from "../../../../shared/components/messaging";
import { useUsersQuery } from "../../../../shared/api/users";
import type { User } from "../../../../shared/types";
import { Avatar, EmptyState, Icon } from "../../../../shared/ui";

import {
  groupMessagesByDay,
  parseMessageContent,
  type LocalGroupMessage,
} from "../../utils/messageFormat";
import { messageSkeletons } from "../skeletons/ChatThreadSkeleton";
import { MessageBubble } from "./MessageBubble";

interface ChatThreadProps {
  discussionName: string;
  teamName?: string | null;
  messagesLoading: boolean;
  messagesError: boolean;
  messagesErrorDetails: unknown;
  messagesFetching: boolean;
  messageGroups: ReturnType<typeof groupMessagesByDay>;
  messageListRef: RefObject<HTMLDivElement | null>;
  getUserAvatarUrl: (userId: string) => string | null | undefined;
  composer: ReactNode;
  onEditMessage: (message: LocalGroupMessage) => void;
  onDeleteMessage: (messageId: string) => void;
}

export function ChatThread({
  discussionName,
  teamName,
  messagesLoading,
  messagesError,
  messagesErrorDetails,
  messagesFetching,
  messageGroups,
  messageListRef,
  getUserAvatarUrl,
  composer,
  onEditMessage,
  onDeleteMessage,
}: ChatThreadProps) {
  const [openMenuMessageId, setOpenMenuMessageId] = useState<string | null>(
    null,
  );
  const [menuAnchor, setMenuAnchor] = useState<MessageMenuAnchor | null>(null);
  const [messageToDelete, setMessageToDelete] =
    useState<LocalGroupMessage | null>(null);
  const [messageToShare, setMessageToShare] =
    useState<LocalGroupMessage | null>(null);
  const [sharingUserId, setSharingUserId] = useState<string | null>(null);

  const usersQuery = useUsersQuery({ enabled: Boolean(messageToShare) });

  function handleAction(message: LocalGroupMessage, action: MessageAction) {
    if (action === "copy") {
      const { text } = parseMessageContent(message.content);
      const value = text.trim();
      if (value) {
        void navigator.clipboard.writeText(value).catch(() => undefined);
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

    setMessageToShare(message);
  }

  function handleConfirmDelete() {
    if (!messageToDelete) return;
    onDeleteMessage(messageToDelete.id);
    setMessageToDelete(null);
  }

  function handleShareSelect(user: User) {
    setSharingUserId(user.id);

    window.setTimeout(() => {
      setSharingUserId(null);
      setMessageToShare(null);
    }, 400);
  }

  return (
    <section className="thread-panel">
      <header className="thread-header dm-thread-header">
        <Avatar name={discussionName} size={36} />
        <span>
          <strong>{discussionName}</strong>
          <small>
            {teamName ? `Equipe ${teamName}` : "Discussion de groupe"}
          </small>
        </span>

        <button className="icon-button" type="button" aria-label="Rechercher">
          <Icon name="search" size={16} />
        </button>

        <button className="icon-button" type="button" aria-label="Options">
          <Icon name="moreH" size={16} />
        </button>
      </header>

      <div className="message-list" ref={messageListRef}>
        {messagesLoading ? (
          messageSkeletons.map((item, index) => (
            <article
              className={
                index % 2 === 0
                  ? "message-bubble chat-message-skeleton"
                  : "message-bubble mine chat-message-skeleton"
              }
              key={item}
              aria-hidden="true"
            >
              {index % 2 === 0 ? <span className="skeleton-avatar" /> : null}
              <div className="skeleton-copy">
                <span className="skeleton-line chat-skeleton-message-meta" />
                <span className="skeleton-line" />
                <span className="skeleton-line chat-skeleton-message-short" />
              </div>
            </article>
          ))
        ) : messagesError ? (
          <EmptyState
            title="Impossible de charger les messages"
            body={
              messagesErrorDetails instanceof Error
                ? messagesErrorDetails.message
                : "Une erreur est survenue."
            }
          />
        ) : messageGroups.length ? (
          messageGroups.map((group) => (
            <div key={group.dateKey}>
              <div className="date-separator">
                <span />
                {group.label}
                <span />
              </div>

              {group.items.map((message: LocalGroupMessage) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  avatarSrc={getUserAvatarUrl(message.senderId)}
                  menuOpen={openMenuMessageId === message.id}
                  menuAnchor={
                    openMenuMessageId === message.id ? menuAnchor : null
                  }
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
              ))}
            </div>
          ))
        ) : (
          <EmptyState
            title="Discussion vide"
            body={`Envoyez le premier message dans ${discussionName}.`}
          />
        )}

        {messagesFetching && !messagesLoading ? (
          <p className="chat-refresh-hint">Actualisation...</p>
        ) : null}
      </div>

      {composer}

      <DeleteMessageConfirmModal
        open={Boolean(messageToDelete)}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <MessageShareModal
        open={Boolean(messageToShare)}
        loading={usersQuery.loading}
        error={usersQuery.error}
        users={usersQuery.data ?? []}
        sharingUserId={sharingUserId}
        onClose={() => {
          if (sharingUserId) return;
          setMessageToShare(null);
        }}
        onRetry={() => {
          void usersQuery.refetch();
        }}
        onSelect={handleShareSelect}
      />
    </section>
  );
}
