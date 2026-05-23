import { NavLink, useParams } from 'react-router-dom';
import { mockApi, useMockQuery } from '../../shared/api';
import { files, users } from '../../shared/api/mockData';
import { useAuth } from '../../shared/context';
import type { Message } from '../../shared/types';
import { Avatar, EmptyState, FileIcon, Icon, LoadingState } from '../../shared/ui';

function MessageBubble({ message }: { message: Message }) {
  const { user } = useAuth();
  const author = users.find((item) => item.id === message.authorId) ?? users[0];
  const attachment = message.attachmentId ? files.find((file) => file.id === message.attachmentId) : undefined;
  const mine = user?.id === message.authorId;

  return (
    <article className={mine ? 'message-bubble mine' : 'message-bubble'}>
      <Avatar name={author.name} size={28} presence={author.presence} />
      <div>
        <header>
          <strong>{author.name}</strong>
          <small>{message.when}</small>
        </header>
        <p>{message.content}</p>
        {attachment ? (
          <div className="message-attachment">
            <FileIcon ext={attachment.ext} color={attachment.color} size={30} />
            <span>
              <strong>{attachment.name}</strong>
              <small>{attachment.size}</small>
            </span>
            <Icon name="download" size={16} />
          </div>
        ) : null}
        {message.reactions ? (
          <div className="reaction-row">
            {message.reactions.map((reaction) => (
              <span key={reaction.emoji}>{reaction.emoji} {reaction.count}</span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ChatPage() {
  const { channelId = 'design-acredi' } = useParams();
  const { data: channelData, loading: channelsLoading } = useMockQuery(mockApi.getChannels, 'channels');
  const { data: messageData, loading: messagesLoading } = useMockQuery(() => mockApi.getMessages(channelId), `messages:${channelId}`);
  const { data: conversationData } = useMockQuery(mockApi.getConversations, 'conversations');

  if (channelsLoading || messagesLoading || !channelData || !messageData) {
    return <LoadingState label="Chargement du canal..." />;
  }

  const activeChannel = channelData.find((channel) => channel.id === channelId) ?? channelData[0];
  const members = activeChannel.memberIds.map((id) => users.find((user) => user.id === id)).filter(Boolean);
  const recentFiles = activeChannel.recentFileIds.map((id) => files.find((file) => file.id === id)).filter(Boolean);

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <label className="mini-search">
          <Icon name="search" size={14} />
          <input placeholder="Rechercher..." />
        </label>
        <p className="section-label split"><span>Canaux</span><Icon name="plus"  className="cursor-pointer" size={12} /></p>
        <nav className="chat-nav channel-nav">
          {channelData.map((channel) => (
            <NavLink key={channel.id} to={`/app/chat/${channel.id}`}>
              <Icon name="hash" size={14} />
              <span>{channel.name}</span>
              {channel.unread > 0 ? <small className={channel.urgent ? 'danger' : ''}>{channel.unread}</small> : null}
            </NavLink>
          ))}
        </nav>

        <p className="section-label split dm-section-label"><span>Messages directs</span><Icon name="plus" className="cursor-pointer" size={12} /></p>
        <nav className="chat-nav dm-nav">
          {(conversationData ?? []).map((conversation) => {
            const person = users.find((item) => item.id === conversation.userId) ?? users[0];
            return (
              <NavLink key={conversation.id} to={`/app/dm/${conversation.id}`}>
                <Avatar name={person.name} size={20} />
                <span>{person.name}</span>
                <span className={`dm-presence presence-${person.presence}`} />
                {/* {conversation.unread > 0 ? <small>{conversation.unread}</small> : null} */}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <section className="thread-panel">
        <header className="thread-header">
          <Icon name="hash" size={18} />
          <span>
            <strong>{activeChannel.name}</strong>
            <small>{activeChannel.description} - {activeChannel.memberIds.length} membres</small>
          </span>
          <button className="icon-button" type="button" aria-label="Lancer une reunion"><Icon name="video" size={16} /></button>
          <button className="icon-button" type="button" aria-label="Rechercher"><Icon name="search" size={16} /></button>
          <button className="icon-button" type="button" aria-label="Options"><Icon name="moreH" size={16} /></button>
        </header>

        <div className="message-list">
          <div className="date-separator"><span />SAMEDI 23 MAI<span /></div>
          {messageData.length ? messageData.map((message) => <MessageBubble key={message.id} message={message} />) : (
            <EmptyState title="Canal calme" body="Aucun message dans ce canal pour le moment." />
          )}
          <div className="typing-row"><i /><i /><i />Yann Hallage est en train d ecrire...</div>
        </div>

        <form className="composer">
          <textarea defaultValue="Une mention @Mlle Yeo : oui, on garde 5B6CFF pour cette version." />
          <div>
            <button className="icon-button" type="button" aria-label="Joindre"><Icon name="paperclip" size={15} /></button>
            <button className="icon-button" type="button" aria-label="Emoji"><Icon name="smile" size={15} /></button>
            <button className="icon-button" type="button" aria-label="Video"><Icon name="video" size={15} /></button>
            <span />
            <small>Entree envoyer</small>
            <button className="button primary" type="button"><Icon name="send" size={14} /></button>
          </div>
        </form>
      </section>

      <aside className="details-panel">
        <header>
          <strong>Details du canal</strong>
          <Icon name="moreH" size={16} />
        </header>
        <section>
          <p className="section-label">A propos</p>
          <p className="muted">{activeChannel.description}</p>
        </section>
        <section>
          <p className="section-label split"><span>Membres</span><span>{members.length}</span></p>
          <ul className="people-list compact">
            {members.map((member) => member ? (
              <li key={member.id}>
                <Avatar name={member.name} size={24} presence={member.presence} />
                <span><strong>{member.name}</strong><small>{member.team}</small></span>
              </li>
            ) : null)}
          </ul>
        </section>
        <section>
          <p className="section-label">Fichiers recents</p>
          <ul className="file-row-list compact">
            {recentFiles.map((file) => file ? (
              <li key={file.id}>
                <FileIcon ext={file.ext} color={file.color} size={22} />
                <span>{file.name}</span>
                <small>{file.size}</small>
              </li>
            ) : null)}
          </ul>
        </section>
      </aside>
    </div>
  );
}
