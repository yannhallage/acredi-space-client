import type { ReactNode, RefObject } from "react";

import { Avatar, EmptyState, Icon } from "../../../../shared/ui";

import { groupMessagesByDay, type LocalGroupMessage } from "../../utils/messageFormat";
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
}: ChatThreadProps) {
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
    </section>
  );
}
