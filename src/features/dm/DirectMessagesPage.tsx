import { NavLink, useParams } from 'react-router-dom';
import { mockApi, useMockQuery } from '../../shared/api';
import { users } from '../../shared/api/mockData';
import type { Message } from '../../shared/types';
import { Avatar, EmptyState, Icon, LoadingState } from '../../shared/ui';

function DirectMessageBubble({ message }: { message: Message }) {
  const author = users.find((user) => user.id === message.authorId) ?? users[0];
  const mine = message.authorId === 'u-mohamed';
  return (
    <article className={mine ? 'dm-message mine' : 'dm-message'}>
      <Avatar name={author.name} size={30} presence={author.presence} />
      <div>
        <header><strong>{author.name}</strong><small>{message.when}</small></header>
        <p>{message.content}</p>
      </div>
    </article>
  );
}

export function DirectMessagesPage() {
  const { conversationId = 'dm-yann' } = useParams();
  const { data: conversations, loading: conversationsLoading } = useMockQuery(mockApi.getConversations, 'dm-list');
  const { data: thread, loading: threadLoading } = useMockQuery(() => mockApi.getDirectMessages(conversationId), `dm:${conversationId}`);

  if (conversationsLoading || threadLoading || !conversations || !thread) {
    return <LoadingState label="Chargement des messages directs..." />;
  }

  const active = conversations.find((conversation) => conversation.id === conversationId) ?? conversations[0];
  const activeUser = users.find((user) => user.id === active.userId) ?? users[1];

  return (
    <div className="dm-page">
      <aside className="dm-list">
        <label className="mini-search">
          <Icon name="search" size={14} />
          <input placeholder="Chercher une personne..." />
        </label>
        {conversations.map((conversation) => {
          const person = users.find((user) => user.id === conversation.userId) ?? users[0];
          return (
            <NavLink key={conversation.id} to={`/app/dm/${conversation.id}`} className="conversation-link">
              <Avatar name={person.name} size={34} presence={person.presence} />
              <span>
                <strong>{person.name}</strong>
                <small>{conversation.lastMessage}</small>
              </span>
              <time>{conversation.updatedAt}</time>
              {conversation.unread > 0 ? <b>{conversation.unread}</b> : null}
            </NavLink>
          );
        })}
      </aside>

      <section className="thread-panel dm-thread">
        <header className="thread-header">
          <Avatar name={activeUser.name} size={34} presence={activeUser.presence} />
          <span>
            <strong>{activeUser.name}</strong>
            <small>{activeUser.role} - {activeUser.status}</small>
          </span>
          <button className="icon-button" type="button" aria-label="Appel video"><Icon name="video" size={16} /></button>
          <button className="icon-button" type="button" aria-label="Options"><Icon name="moreH" size={16} /></button>
        </header>

        <div className="message-list">
          {thread.length ? thread.map((message) => <DirectMessageBubble key={message.id} message={message} />) : (
            <EmptyState title="Conversation vide" body="Envoyez le premier message a cette personne." />
          )}
        </div>

        <form className="composer">
          <textarea placeholder={`Ecrire a ${activeUser.name}...`} />
          <div>
            <button className="icon-button" type="button" aria-label="Joindre"><Icon name="paperclip" size={15} /></button>
            <button className="icon-button" type="button" aria-label="Emoji"><Icon name="smile" size={15} /></button>
            <span />
            <button className="button primary" type="button"><Icon name="send" size={14} /> Envoyer</button>
          </div>
        </form>
      </section>
    </div>
  );
}
