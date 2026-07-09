import {
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";

import { Avatar, EmptyState, Icon } from "../../../../shared/ui";

import {
  groupMessagesByDay,
  type LocalGroupMessage,
} from "../../utils/messageFormat";
import { messageSkeletons } from "../skeletons/ChatThreadSkeleton";
import { MessageActionMenu } from "./MessageActionMenu";
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

  currentUserId: string;
  onForwardMessage: (message: LocalGroupMessage) => void;
  onEditMessage: (message: LocalGroupMessage) => void;
  onDeleteMessage: (message: LocalGroupMessage) => void;
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

  currentUserId,
  onForwardMessage,
  onEditMessage,
  onDeleteMessage,
}: ChatThreadProps) {
  const [activeMenu, setActiveMenu] = useState<{
    message: LocalGroupMessage;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    function closeMenu() {
      setActiveMenu(null);
    }

    if (activeMenu) {
      document.addEventListener("click", closeMenu);
      window.addEventListener("scroll", closeMenu, true);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [activeMenu]);

  function openMessageMenu(
    event: MouseEvent<HTMLDivElement>,
    message: LocalGroupMessage
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (message.deleted) {
      return;
    }

    const menuWidth = 180;
    const menuHeight = 150;

    const x = Math.min(
      event.clientX + 8,
      window.innerWidth - menuWidth - 8
    );

    const y = Math.min(
      event.clientY + 8,
      window.innerHeight - menuHeight - 8
    );

    setActiveMenu({
      message,
      x: Math.max(8, x),
      y: Math.max(8, y),
    });
  }

  const activeMessage = activeMenu?.message;
  const activeMessageIsMine =
    activeMessage?.senderId === currentUserId;

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

              {group.items.map((message: LocalGroupMessage) => {
                const isDeleted = Boolean(message.deleted);

                return (
                  <div
                    key={message.id}
                    className="chat-message-selection-wrapper"
                    onClick={(event) => {
                      if (isDeleted) {
                        return;
                      }

                      openMessageMenu(event, message);
                    }}
                    onContextMenu={(event) => {
                      if (isDeleted) {
                        return;
                      }

                      openMessageMenu(event, message);
                    }}
                  >
                    <MessageBubble
                      message={message}
                      avatarSrc={getUserAvatarUrl(message.senderId)}
                      currentUserId={currentUserId}
                    />
                  </div>
                );
              })}
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

      {activeMenu && activeMessage ? (
        <MessageActionMenu
  open={true}
  x={activeMenu.x}
  y={activeMenu.y}
  canEdit={Boolean(activeMessageIsMine && !activeMessage.deleted)}
  canDelete={Boolean(activeMessageIsMine && !activeMessage.deleted)}
  onForward={() => onForwardMessage(activeMessage)}
  onEdit={() => onEditMessage(activeMessage)}
  onDelete={() => onDeleteMessage(activeMessage)}
  onClose={() => setActiveMenu(null)}
/>
      ) : null}

      {composer}
    </section>
  );
}