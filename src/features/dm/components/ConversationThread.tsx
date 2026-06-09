import { files, users } from '../../../shared/api/mockData';
import { useAuth } from '../../../shared/context';
import type { Message, User } from '../../../shared/types';
import { Avatar, EmptyState, FileIcon, Icon } from '../../../shared/ui';

interface ConversationThreadProps {
  activeUser: User;
  messages: Message[];
}

function DirectMessageBubble({ message }: { message: Message }) {
  const { user } = useAuth();
  const author = users.find((item) => item.id === message.authorId) ?? users[0];
  const attachment = message.attachmentId ? files.find((file) => file.id === message.attachmentId) : undefined;
  const mine = message.authorId === user?.id;

  return (
    <article className={mine ? 'dm-message mine' : 'dm-message'}>
      {!mine ? <Avatar name={author.name} size={28} presence={author.presence} /> : null}
      <div>
        {!mine ? <header><strong>{author.name}</strong><small>{message.when}</small></header> : null}
        <p>{message.content}</p>
        {attachment ? (
          <div className="dm-attachment">
            <FileIcon ext={attachment.ext} color={attachment.color} size={28} />
            <span>
              <strong>{attachment.name}</strong>
              <small>{attachment.size}</small>
            </span>
            <Icon name="download" size={14} />
          </div>
        ) : null}
        <small className="dm-message-time">{message.when} - vu</small>
      </div>
    </article>
  );
}

export function ConversationThread({ activeUser, messages }: ConversationThreadProps) {
  return (
    <section className="thread-panel dm-thread">
      <header className="thread-header dm-thread-header">
        <Avatar name={activeUser.name} size={36} />
        <span>
          <strong>{activeUser.name}</strong>
          <small><i />{activeUser.role}</small>
        </span>
        <button className="icon-button" type="button" aria-label="Appel video"><Icon name="video" size={16} /></button>
        <button className="icon-button" type="button" aria-label="Rechercher"><Icon name="search" size={16} /></button>
        <button className="icon-button" type="button" aria-label="Options"><Icon name="moreH" size={16} /></button>
      </header>

      <div className="message-list dm-message-list">
        {messages.length ? messages.map((message, index) => (
          <div key={message.id}>
            {index === 0 ? <div className="date-separator"><span />HIER<span /></div> : null}
            {index === 4 ? <div className="date-separator"><span />AUJOURD'HUI<span /></div> : null}
            <DirectMessageBubble message={message} />
          </div>
        )) : (
          <EmptyState title="Conversation vide" body="Envoyez le premier message a cette personne." />
        )}
      </div>

      <form className="composer">
        <textarea placeholder={`Ecrire a ${activeUser.name}...`} />
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
  );
}
