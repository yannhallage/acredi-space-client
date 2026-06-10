import { useMemo, useState } from "react";

import type { ChannelResponse } from "../../../shared/api/dm/types";
import type { User } from "../../../shared/types";

import { NewDirectConversationModal } from "./NewConversationModal";

interface DirectConversationListProps {
  conversations: ChannelResponse[];
  users?: User[];
  activeConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onConversationCreated: (channel: ChannelResponse) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getConversationName(conversation: ChannelResponse) {
  return (
    conversation.displayName ||
    conversation.name ||
    (conversation.privateChannel ? "Discussion privée" : "Conversation")
  );
}

function formatConversationTime(value?: string) {
  if (!value) return "";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
}

function getConversationPreview(conversation: ChannelResponse) {
  if (conversation.lastMessage?.trim()) {
    return conversation.lastMessage;
  }

  return conversation.privateChannel
    ? "Discussion directe"
    : "Canal de discussion";
}

export function DirectConversationList({
  conversations,
  users = [],
  activeConversationId,
  onSelectConversation,
  onConversationCreated,
}: DirectConversationListProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const usersByName = useMemo(() => {
    const map = new Map<string, User>();

    users.forEach((user) => {
      map.set(user.name.toLowerCase(), user);
    });

    return map;
  }, [users]);

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return conversations;

    return conversations.filter((conversation) =>
      getConversationName(conversation).toLowerCase().includes(value)
    );
  }, [conversations, search]);

  return (
    <>
      <aside className="dm-sidebar">
        {/* <div className="dm-sidebar-header">
          <div>
            <p className="dm-section-label">COLLABORATION</p>
            <h1>Messages directs</h1>
          </div>
        </div> */}

        <div className="dm-panel">
          <div className="dm-panel-title">
            <h2>Messages</h2>

            <button
              className="dm-new-button"
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="Nouvelle conversation"
            >
              +
            </button>
          </div>

          <div className="dm-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une conversation..."
            />
          </div>

          <div className="dm-tabs">
            <button className="active" type="button">
              Toutes
            </button>
            <button type="button">Non lues</button>
            <button type="button">Mentions</button>
          </div>

          <div className="dm-conversation-list">
            {filteredConversations.length === 0 ? (
              <div className="dm-list-empty">Aucune conversation trouvée.</div>
            ) : (
              filteredConversations.map((conversation) => {
                const name = getConversationName(conversation);
                const isActive = conversation.id === activeConversationId;
                const participant = usersByName.get(name.toLowerCase());
                const presence = participant?.presence ?? "online";

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`dm-conversation-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="dm-avatar">
                      {getInitials(name)}
                      <span className={`dm-status ${presence}`} />
                    </div>

                    <div className="dm-conversation-content">
                      <div className="dm-conversation-top">
                        <strong>{name}</strong>
                        <span>
                          {formatConversationTime(conversation.lastMessageAt)}
                        </span>
                      </div>

                      <div className="dm-conversation-bottom">
                        <p>{getConversationPreview(conversation)}</p>

                        {conversation.unreadCount ? (
                          <span className="dm-badge">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
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
