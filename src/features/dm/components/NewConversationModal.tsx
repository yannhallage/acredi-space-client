import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { users } from '../../../shared/api/mockData';
import { useAuth } from '../../../shared/context';
import type { Conversation, Presence } from '../../../shared/types';
import { Avatar, Icon } from '../../../shared/ui';

const presenceLabels: Record<Presence, string> = {
  online: 'Disponible',
  busy: 'Occupe',
  dnd: 'Concentration',
  offline: 'Hors ligne'
};

interface NewConversationModalProps {
  isOpen: boolean;
  conversations: Conversation[];
  onClose: () => void;
  onSelectConversation: (conversationId: string) => void;
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function NewConversationModal({
  isOpen,
  conversations,
  onClose,
  onSelectConversation
}: NewConversationModalProps) {
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');

  const conversationByUserId = useMemo(
    () => new Map(conversations.map((conversation) => [conversation.userId, conversation])),
    [conversations]
  );

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(query.trim());

    return users
      .filter((person) => person.id !== currentUser?.id)
      .filter((person) => conversationByUserId.has(person.id))
      .filter((person) => {
        if (!normalizedQuery) {
          return true;
        }

        const searchable = normalizeSearch([
          person.name,
          person.email,
          person.role,
          person.team,
          person.status
        ].join(' '));

        return searchable.includes(normalizedQuery);
      });
  }, [conversationByUserId, currentUser?.id, query]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  function selectUser(userId: string) {
    const conversation = conversationByUserId.get(userId);

    if (!conversation) {
      return;
    }

    onSelectConversation(conversation.id);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="dm-new-conversation-overlay"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="dm-new-conversation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dm-new-conversation-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="dm-new-conversation-header">
              <div>
                <h2 id="dm-new-conversation-title">Nouvelle conversation</h2>
                <small>{visibleUsers.length} contacts disponibles</small>
              </div>
              <button className="icon-button" type="button" aria-label="Fermer" onClick={onClose}>
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
              {visibleUsers.map((person) => {
                const conversation = conversationByUserId.get(person.id);

                return (
                  <button
                    key={person.id}
                    className="dm-new-conversation-user"
                    type="button"
                    onClick={() => selectUser(person.id)}
                  >
                    <Icon name="arrowRight" size={16} />
                    <Avatar name={person.name} size={34} presence={person.presence} />
                    <span>
                      <strong>{person.name}</strong>
                      <small>{person.role} - {person.team}</small>
                    </span>
                    <em className={`dm-new-conversation-status presence-${person.presence}`}>
                      {presenceLabels[person.presence]}
                    </em>
                    {conversation && conversation.unread > 0 ? <b>{conversation.unread}</b> : null}
                  </button>
                );
              })}

              {visibleUsers.length === 0 ? (
                <div className="dm-new-conversation-empty">
                  <Icon name="users" size={18} />
                  <strong>Aucun utilisateur trouve</strong>
                  <span>Essayez un autre nom, email ou role.</span>
                </div>
              ) : null}
            </div>

            <footer className="dm-new-conversation-footer">
              <span>
                <Icon name="message" size={14} />
                Message direct
              </span>
              <small>{conversations.length} conversations</small>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
