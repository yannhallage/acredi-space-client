import { useState, type ReactNode, type RefObject } from "react";

import {
  DeleteMessageConfirmModal,
  MessageShareModal,
  type MessageAction,
  type MessageMenuAnchor,
  type MessageShareTarget,
} from "../../../../shared/components/messaging";
import { useShareDiscussionMessage } from "../../../../shared/api/discussions/hooks";
import { discussionService } from "../../../../shared/api/discussions/service";
import { useMyTeamsQuery } from "../../../../shared/api/teams";
import { useUsersQuery } from "../../../../shared/api/users";
import { getFriendlyErrorMessage } from "../../../../shared/feedback";
import { Avatar, EmptyState, Icon } from "../../../../shared/ui";

import {
  groupMessagesByDay,
  parseMessageContent,
  type LocalGroupMessage,
} from "../../utils/messageFormat";
import { messageSkeletons } from "../skeletons/ChatThreadSkeleton";
import { MessageBubble } from "./MessageBubble";

interface ChatThreadProps {
  discussionId: string;
  discussionName: string;
  teamName?: string | null;
  messagesLoading: boolean;
  messagesError: boolean;
  messagesErrorDetails: unknown;
  messagesFetching: boolean;
  loadingOlder?: boolean;
  messageGroups: ReturnType<typeof groupMessagesByDay>;
  messageListRef: RefObject<HTMLDivElement | null>;
  getUserAvatarUrl: (userId: string) => string | null | undefined;
  typingLabel?: string | null;
  composer: ReactNode;
  showBackButton?: boolean;
  onClose?: () => void;
  onEditMessage: (message: LocalGroupMessage) => void;
  onDeleteMessage: (messageId: string) => void;
}

export function ChatThread({
  discussionId,
  discussionName,
  teamName,
  messagesLoading,
  messagesError,
  messagesErrorDetails,
  messagesFetching,
  loadingOlder = false,
  messageGroups,
  messageListRef,
  getUserAvatarUrl,
  typingLabel = null,
  composer,
  showBackButton = false,
  onClose,
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
  const [sharingTargetId, setSharingTargetId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const usersQuery = useUsersQuery({ enabled: Boolean(messageToShare) });
  const teamsQuery = useMyTeamsQuery({ enabled: Boolean(messageToShare) });
  const shareDiscussionMessage = useShareDiscussionMessage();

  const shareLoading = usersQuery.loading || teamsQuery.loading;
  const shareQueryError = usersQuery.error ?? teamsQuery.error;

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
        await shareDiscussionMessage.mutateAsync({
          discussionId,
          messageId: messageToShare.id,
          userId: target.user.id,
        });
      } else {
        const discussions = await discussionService.findByTeam(target.team.id);
        const destination =
          discussions.find((item) => item.id !== discussionId) ??
          discussions[0];

        if (!destination) {
          throw new Error(
            "Cette equipe n'a pas encore de discussion de groupe.",
          );
        }

        if (destination.id === discussionId) {
          throw new Error(
            "Le message est deja dans la seule discussion de cette equipe.",
          );
        }

        await shareDiscussionMessage.mutateAsync({
          discussionId,
          messageId: messageToShare.id,
          targetDiscussionId: destination.id,
        });
      }

      setMessageToShare(null);
    } catch (error) {
      setShareError(
        getFriendlyErrorMessage(error, "Impossible de partager ce message."),
      );
    } finally {
      setSharingTargetId(null);
    }
  }

  return (
    <section className="thread-panel">
      <header className="thread-header dm-thread-header">
        {showBackButton && onClose ? (
          <button
            type="button"
            className="chat-thread-back-button"
            aria-label="Retour aux discussions"
            title="Retour"
            onClick={onClose}
          >
            <Icon name="arrowLeft" size={18} />
          </button>
        ) : null}

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
        {loadingOlder ? (
          <p className="chat-history-hint">Chargement de l'historique...</p>
        ) : null}
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

        {messagesFetching && !messagesLoading && !loadingOlder ? (
          <p className="chat-refresh-hint">Actualisation...</p>
        ) : null}
      </div>

      {typingLabel ? (
        <div className="typing-row" aria-live="polite" aria-label="En train d'ecrire">
          <span className="typing-row-dots">
            <i />
            <i />
            <i />
          </span>
        </div>
      ) : null}

      {composer}

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
    </section>
  );
}