import type { Conversation } from '../../../shared/types';
import { users } from '../../../shared/api/mockData';
import { Avatar, Icon } from '../../../shared/ui';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({ conversations, activeConversationId, onSelectConversation }: ConversationListProps) {
  return (
    <aside className="dm-list">
      <header className="dm-list-header">
        <h1>Messages</h1>
        <button className="icon-button" type="button" aria-label="Nouvelle conversation">
          <Icon name="plus" size={14} />
        </button>
      </header>

      <label className="mini-search">
        <Icon name="search" size={14} />
        <input placeholder="Rechercher une conversation..." />
      </label>

      <div className="dm-tabs">
        <button className="active" type="button">Toutes</button>
        <button type="button">Non lues</button>
        <button type="button">Mentions</button>
      </div>

      {conversations.map((conversation) => {
        const person = users.find((user) => user.id === conversation.userId) ?? users[0];
        const active = conversation.id === activeConversationId;

        return (
          <button
            key={conversation.id}
            className={active ? 'conversation-link active' : 'conversation-link'}
            type="button"
            onClick={() => onSelectConversation(conversation.id)}
          >
            <Avatar name={person.name} size={36} presence={person.presence} />
            <span>
              <strong>{person.name}</strong>
              <small>{conversation.lastMessage}</small>
            </span>
            <time>{conversation.updatedAt}</time>
            {conversation.unread > 0 ? <b>{conversation.unread}</b> : null}
          </button>
        );
      })}
    </aside>
  );
}
