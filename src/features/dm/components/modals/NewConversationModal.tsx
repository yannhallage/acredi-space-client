import { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";

import { useCreateDirectChannelMutation } from "../../../../shared/api/dm/hooks";
import type { ChannelResponse } from "../../../../shared/api/dm/types";
import { useUsersQuery } from "../../../../shared/api/users";
import { useAuth } from "../../../../shared/context";
import { getFriendlyErrorMessage } from "../../../../shared/feedback";
import type { User } from "../../../../shared/types";
import { Avatar, Icon } from "../../../../shared/ui";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function userPresenceLabel(user: Pick<User, "enabled" | "presence">) {
  return user.enabled === false || user.presence === "offline"
    ? "Inactif"
    : "Disponible";
}

interface NewDirectConversationModalProps {
  open: boolean;
  conversations: ChannelResponse[];
  onClose: () => void;
  onCreated: (channel: ChannelResponse) => void;
}

export function NewDirectConversationModal({
  open,
  conversations,
  onClose,
  onCreated,
}: NewDirectConversationModalProps) {
  const { user: currentUser } = useAuth();

  const usersQuery = useUsersQuery({ enabled: open });
  const createDirectChannelMutation = useCreateDirectChannelMutation();

  const [query, setQuery] = useState("");
  const [creatingUserId, setCreatingUserId] = useState<string | null>(null);

  const directConversations = useMemo(() => {
    return conversations.filter((channel) => channel.privateChannel);
  }, [conversations]);

  const unreadByUserName = useMemo(() => {
    const map = new Map<string, number>();

    directConversations.forEach((channel) => {
      if (!channel.displayName || !channel.unreadCount) return;

      map.set(channel.displayName.toLowerCase(), channel.unreadCount);
    });

    return map;
  }, [directConversations]);

  const visibleUsers = useMemo(() => {
    const users = (usersQuery.data ?? []).filter(
      (user) => user.id !== currentUser?.id
    );

    const normalizedQuery = normalizeSearch(query.trim());

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => {
      const searchable = normalizeSearch(
        [user.name, user.email, user.role, user.team, user.status]
          .filter(Boolean)
          .join(" ")
      );

      return searchable.includes(normalizedQuery);
    });
  }, [currentUser?.id, query, usersQuery.data]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCreatingUserId(null);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleCreateDirectConversation(user: User) {
    if (createDirectChannelMutation.isPending) return;

    setCreatingUserId(user.id);

    createDirectChannelMutation.mutate(
      { userId: user.id },
      {
        onSuccess: (channel) => {
          onCreated(channel);
          onClose();
        },
        onSettled: () => {
          setCreatingUserId(null);
        },
      }
    );
  }

  const isCreating = createDirectChannelMutation.isPending;
  const isLoadingUsers = usersQuery.loading;
  const hasError = Boolean(usersQuery.error);
  const hasNoUsers = !isLoadingUsers && !hasError && visibleUsers.length === 0;

  return (
    <div
      className="dm-new-conversation-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="dm-new-conversation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dm-new-conversation-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dm-new-conversation-header">
          <div>
            <h2 id="dm-new-conversation-title">Nouvelle conversation</h2>
            <small>{visibleUsers.length} contacts disponibles</small>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Fermer"
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <label className="dm-new-conversation-search">
          <Icon name="search" size={16} />

          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un utilisateur..."
          />
        </label>

        <div className="dm-new-conversation-list">
          <p>Utilisateurs</p>

          {isLoadingUsers ? (
            ["dm-user-loading-1", "dm-user-loading-2", "dm-user-loading-3"].map(
              (item) => (
                <div
                  className="dm-new-conversation-user team-picker-row-skeleton"
                  key={item}
                >
                  <span className="skeleton-dot" />
                  <span className="skeleton-avatar" />
                  <span>
                    <span className="skeleton-line" />
                    <span className="skeleton-line skeleton-short" />
                  </span>
                  <span className="skeleton-pill" />
                </div>
              )
            )
          ) : (
            visibleUsers.map((person) => {
              const unread =
                unreadByUserName.get(person.name.toLowerCase()) ?? 0;

              const isCreatingThisUser = creatingUserId === person.id;

              return (
                <button
                  key={person.id}
                  className="dm-new-conversation-user"
                  type="button"
                  disabled={isCreating}
                  onClick={() => handleCreateDirectConversation(person)}
                >
                  {isCreatingThisUser ? (
                    <ClipLoader size={14} color="currentColor" />
                  ) : (
                    <Icon name="send" size={16} />
                  )}

                  <Avatar
                    name={person.name}
                    presence={person.presence}
                    size={34}
                    src={person.avatarUrl}
                  />

                  <span>
                    <strong>{person.name}</strong>
                    <small>
                      {person.role} - {person.team}
                    </small>
                  </span>

                  <em
                    className={`dm-new-conversation-status presence-${person.presence}`}
                  >
                    {userPresenceLabel(person)}
                  </em>

                  {unread > 0 ? <b>{unread}</b> : null}
                </button>
              );
            })
          )}

          {!isLoadingUsers && usersQuery.error ? (
            <div className="dm-new-conversation-empty">
              <Icon name="alert" size={18} />
              <strong>Chargement impossible</strong>
              <span>
                {getFriendlyErrorMessage(
                  usersQuery.error,
                  "Nous n’avons pas pu charger les utilisateurs.",
                )}
              </span>

              {"refetch" in usersQuery ? (
                <button
                  className="button ghost mini"
                  type="button"
                  onClick={() => {
                    usersQuery.refetch().catch(() => undefined);
                  }}
                >
                  Réessayer
                </button>
              ) : null}
            </div>
          ) : null}

          {hasNoUsers ? (
            <div className="dm-new-conversation-empty">
              <Icon name="users" size={18} />
              <strong>Aucun utilisateur trouvé</strong>
              <span>Essayez un autre nom, email ou rôle.</span>
            </div>
          ) : null}
        </div>

        <footer className="dm-new-conversation-footer">
          <span>
            <Icon name="message" size={14} />
            Message direct
          </span>

          <small>
            {directConversations.length} conversation
            {directConversations.length > 1 ? "s" : ""}
          </small>
        </footer>
      </section>
    </div>
  );
}
