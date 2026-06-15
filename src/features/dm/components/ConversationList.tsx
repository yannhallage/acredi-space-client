import { useMemo, useState } from "react";

import type {
  ChannelResponse,
  MessageResponse,
} from "../../../shared/api/dm/types";
import type { Presence, User } from "../../../shared/types";
import { Avatar, Icon } from "../../../shared/ui";

import { NewDirectConversationModal } from "./NewConversationModal";

interface DirectConversationListProps {
  conversations: ChannelResponse[];
  users?: User[];
  activeConversationId: string;
  activeMessages?: MessageResponse[];
  onSelectConversation: (conversationId: string) => void;
  onConversationCreated: (channel: ChannelResponse) => void;
}

type ConversationFilter = "all" | "unread" | "online";

function getConversationName(conversation: ChannelResponse) {
  return (
    conversation.displayName ||
    conversation.name ||
    (conversation.privateChannel ? "Discussion privee" : "Conversation")
  );
}

function formatConversationTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getLatestMessage(messages: MessageResponse[]) {
  return messages.reduce<MessageResponse | null>((latestMessage, message) => {
    if (!latestMessage) return message;

    return new Date(message.createdAt).getTime() >
      new Date(latestMessage.createdAt).getTime()
      ? message
      : latestMessage;
  }, null);
}

function getConversationPreview(
  conversation: ChannelResponse,
  latestMessage?: MessageResponse | null
) {
  const lastMessage =
    conversation.lastMessage?.trim() || latestMessage?.content?.trim();
  const unreadCount = conversation.unreadCount ?? 0;

  if (lastMessage) {
    return lastMessage;
  }

  if (latestMessage?.attachments?.length) {
    return latestMessage.attachments.length === 1
      ? `Piece jointe : ${latestMessage.attachments[0].name}`
      : `${latestMessage.attachments.length} pieces jointes`;
  }

  if (unreadCount > 0) {
    return "Nouveau message";
  }

  return "Aucun message";
}

function getPresenceLabel(presence: Presence) {
  switch (presence) {
    case "online":
      return "En ligne";
    case "busy":
      return "Occupe";
    case "away":
      return "Absent";
    case "dnd":
      return "Concentre";
    case "offline":
    default:
      return "Hors ligne";
  }
}

function formatRoleLabel(role?: string) {
  const normalized = role?.trim().toUpperCase();

  switch (normalized) {
    case "ADMIN":
      return "Admin";
    case "COLLABORATOR":
      return "Collaborateur";
    case "MANAGER":
      return "Manager";
    case "OWNER":
      return "Owner";
    default:
      return role || "";
  }
}

export function DirectConversationList({
  conversations,
  users = [],
  activeConversationId,
  activeMessages = [],
  onSelectConversation,
  onConversationCreated,
}: DirectConversationListProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const usersByName = useMemo(() => {
    const map = new Map<string, User>();

    users.forEach((user) => {
      map.set(user.name.toLowerCase(), user);
    });

    return map;
  }, [users]);

  const enrichedConversations = useMemo(
    () =>
      conversations.map((conversation) => {
        const name = getConversationName(conversation);
        const participant = usersByName.get(name.toLowerCase());
        const latestActiveMessage =
          conversation.id === activeConversationId
            ? getLatestMessage(activeMessages)
            : null;

        return {
          conversation,
          name,
          participant,
          presence: participant?.presence ?? "offline",
          preview: getConversationPreview(conversation, latestActiveMessage),
          time: formatConversationTime(
            conversation.lastMessageAt || latestActiveMessage?.createdAt
          ),
          unreadCount: conversation.unreadCount ?? 0,
        };
      }),
    [activeConversationId, activeMessages, conversations, usersByName]
  );

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    return enrichedConversations.filter((item) => {
      const matchesSearch =
        !value ||
        item.name.toLowerCase().includes(value) ||
        item.preview.toLowerCase().includes(value) ||
        item.participant?.role.toLowerCase().includes(value);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "unread") {
        return item.unreadCount > 0;
      }

      if (filter === "online") {
        return (
          item.presence === "online" ||
          item.presence === "busy" ||
          item.presence === "away"
        );
      }

      return true;
    });
  }, [enrichedConversations, filter, search]);

  const filters: Array<{
    key: ConversationFilter;
    label: string;
  }> = [
    { key: "all", label: "Toutes" },
    { key: "unread", label: "Non lues" },
    { key: "online", label: "Actifs" },
  ];

  return (
    <>
      <aside className="dm-sidebar" aria-label="Conversations directes">
        <div className="dm-panel">
          <div className="dm-panel-title">
            <div>
              <span className="dm-kicker">Messages directs</span>
              <h2>Messages</h2>
            </div>

            <button
              className="dm-new-button"
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="Nouvelle conversation"
              title="Nouvelle conversation"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>

          <label className="dm-search">
            <Icon name="search" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher..."
            />
          </label>

          <div className="dm-tabs" role="tablist" aria-label="Filtrer les DM">
            {filters.map((item) => (
              <button
                key={item.key}
                className={filter === item.key ? "active" : ""}
                type="button"
                role="tab"
                aria-selected={filter === item.key}
                onClick={() => setFilter(item.key)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="dm-conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="dm-list-empty">
                <Icon name="search" size={18} />
                <strong>Aucune conversation</strong>
                <span>Change le filtre ou lance un nouveau DM.</span>
              </div>
            ) : (
              filteredConversations.map((item) => {
                const { conversation, name, participant, presence } = item;
                const isActive = conversation.id === activeConversationId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`dm-conversation-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <Avatar
                      name={name}
                      presence={presence}
                      size={44}
                      src={participant?.avatarUrl}
                    />

                    <span className="dm-conversation-content">
                      <span className="dm-conversation-top">
                        <strong>{name}</strong>
                        {item.time ? <time>{item.time}</time> : null}
                      </span>

                      <small className="dm-conversation-role">
                        {formatRoleLabel(participant?.role) ||
                          getPresenceLabel(presence)}
                      </small>

                      <span className="dm-conversation-bottom">
                        <p>{item.preview}</p>

                        {item.unreadCount > 0 ? (
                          <b className="dm-badge">{item.unreadCount}</b>
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      <NewDirectConversationModal
        open={modalOpen}
        conversations={conversations}
        onClose={() => setModalOpen(false)}
        onCreated={onConversationCreated}
      />
    </>
  );
}
