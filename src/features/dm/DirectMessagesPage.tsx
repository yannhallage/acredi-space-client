import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockApi, useMockQuery } from '../../shared/api';
import { messages, users } from '../../shared/api/mockData';
import { LoadingState } from '../../shared/ui';
import { ConversationList } from './components/ConversationList';
import { ConversationThread } from './components/ConversationThread';

export function DirectMessagesPage() {
  const { conversationId = 'dm-yann' } = useParams();
  const navigate = useNavigate();
  const { data: conversations, loading } = useMockQuery(mockApi.getConversations, 'dm-list');
  const [selectedConversationId, setSelectedConversationId] = useState(conversationId);

  useEffect(() => {
    setSelectedConversationId(conversationId);
  }, [conversationId]);

  const activeConversation = useMemo(() => {
    if (!conversations) return null;
    return conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0];
  }, [conversations, selectedConversationId]);

  function selectConversation(nextConversationId: string) {
    setSelectedConversationId(nextConversationId);
    navigate(`/app/dm/${nextConversationId}`);
  }

  if (loading || !conversations || !activeConversation) {
    return <LoadingState label="Chargement des messages directs..." />;
  }

  const activeUser = users.find((user) => user.id === activeConversation.userId) ?? users[1];
  const thread = messages.filter((message) => message.conversationId === activeConversation.id);

  return (
    <div className="dm-page">
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversation.id}
        onSelectConversation={selectConversation}
      />
      <ConversationThread activeUser={activeUser} messages={thread} />
    </div>
  );
}
