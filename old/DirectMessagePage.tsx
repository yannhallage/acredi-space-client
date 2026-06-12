// // import { useEffect, useMemo, useState } from 'react';
// // import { useNavigate, useParams } from 'react-router-dom';
// // // import { mockApi, useMockQuery } from '../../shared/api';
// // import { mockApi } from '../../shared/api/mockApi';
// // import { useMockQuery } from '../../shared/api/useMockQuery';
// // import { messages, users } from '../../shared/api/mockData';
// // import { LoadingState } from '../../shared/ui';
// // import { ConversationList } from './components/ConversationList';
// // import { ConversationThread } from './components/ConversationThread';

// // export function DirectMessagesPage() {
// //   const { conversationId = 'dm-yann' } = useParams();
// //   const navigate = useNavigate();
// //   const { data: conversations, loading } = useMockQuery(mockApi.getConversations, 'dm-list');
// //   const [selectedConversationId, setSelectedConversationId] = useState(conversationId);

// //   useEffect(() => {
// //     setSelectedConversationId(conversationId);
// //   }, [conversationId]);

// //   const activeConversation = useMemo(() => {
// //     if (!conversations) return null;
// //     return conversations.find((conversation) => conversation.id === selectedConversationId) ?? conversations[0];
// //   }, [conversations, selectedConversationId]);

// //   function selectConversation(nextConversationId: string) {
// //     setSelectedConversationId(nextConversationId);
// //     navigate(`/app/dm/${nextConversationId}`);
// //   }

// //   if (loading || !conversations || !activeConversation) {
// //     return <LoadingState label="Chargement des messages directs..." />;
// //   }

// //   const activeUser = users.find((user) => user.id === activeConversation.userId) ?? users[1];
// //   const thread = messages.filter((message) => message.conversationId === activeConversation.id);

// //   return (
// //     <div className="dm-page">
// //       <ConversationList
// //         conversations={conversations}
// //         activeConversationId={activeConversation.id}
// //         onSelectConversation={selectConversation}
// //       />
// //       <ConversationThread activeUser={activeUser} messages={thread} />
// //     </div>
// //   );
// // }

// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { LoadingState } from "../../shared/ui";
// import { useChannelsQuery, useMessagesQuery } from "../../shared/api/dm/hooks";
// import { ConversationList } from "./components/ConversationList";
// import { ConversationThread } from "./components/ConversationThread";
// import type {
//   ChannelResponse,
//   MessageResponse,
// } from "../../shared/api/dm/types";

// function getChannelDisplayName(channel?: ChannelResponse | null) {
//   if (!channel) {
//     return "Conversation";
//   }

//   if (channel.displayName) {
//     return channel.displayName;
//   }

//   if (channel.name) {
//     return channel.name;
//   }

//   if (channel.privateChannel) {
//     return "Discussion privée";
//   }

//   return "Conversation";
// }

// // function toThreadMessages(messages: MessageResponse[]) {
// //   return messages.map((message) => ({
// //     id: message.id,
// //     conversationId: message.channelId,
// //     senderId: message.senderId,
// //     content: message.content,
// //     createdAt: message.createdAt,
// //     senderName: message.senderName,
// //   }));
// // }

// export function DirectMessagesPage() {
//   const { conversationId } = useParams();
//   const navigate = useNavigate();

//   const [selectedConversationId, setSelectedConversationId] = useState(
//     conversationId ?? "",
//   );

//   const {
//     data: channels = [],
//     isLoading: channelsLoading,
//     isError: channelsError,
//   } = useChannelsQuery();

//   const activeConversation = useMemo(() => {
//     if (channels.length === 0) {
//       return null;
//     }

//     if (selectedConversationId) {
//       return (
//         channels.find((channel) => channel.id === selectedConversationId) ??
//         channels[0]
//       );
//     }

//     return channels[0];
//   }, [channels, selectedConversationId]);

//   const activeConversationId = activeConversation?.id ?? "";

//   const { data: threadMessages = [], isLoading: messagesLoading } =
//     useMessagesQuery(activeConversationId);

//   useEffect(() => {
//     if (conversationId) {
//       setSelectedConversationId(conversationId);
//     }
//   }, [conversationId]);

//   useEffect(() => {
//     if (!conversationId && activeConversation?.id) {
//       setSelectedConversationId(activeConversation.id);
//       navigate(`/app/dm/${activeConversation.id}`, { replace: true });
//     }
//   }, [conversationId, activeConversation?.id, navigate]);

//   function selectConversation(nextConversationId: string) {
//     setSelectedConversationId(nextConversationId);
//     navigate(`/app/dm/${nextConversationId}`);
//   }

//   if (channelsLoading) {
//     return <LoadingState label="Chargement des conversations..." />;
//   }

//   if (channelsError) {
//     return (
//       <div className="dm-page">
//         <div className="conversation-empty">
//           Impossible de charger les conversations.
//         </div>
//       </div>
//     );
//   }

//   if (!activeConversation) {
//     return (
//       <div className="dm-page">
//         <ConversationList
//           activeConversationId=""
//           onSelectConversation={selectConversation}
//         />

//         <div className="conversation-empty">
//           Aucune conversation disponible.
//         </div>
//       </div>
//     );
//   }

//   const activeUser = {
//     id: activeConversation.id,
//     name: getChannelDisplayName(activeConversation),
//     email: "",
//     // avatarUrl: activeConversation.avatarUrl ?? null,
//     // presence: activeConversation.presence ?? "OFFLINE",
//   };

//   // const thread = toThreadMessages(threadMessages);

//   return (
//     <div className="dm-page">
//       <ConversationList
//         activeConversationId={activeConversation.id}
//         onSelectConversation={selectConversation}
//       />

//       {/* {messagesLoading ? (
//         <LoadingState label="Chargement des messages..." />
//       ) : (
//         // <ConversationThread activeUser={activeUser} messages={thread} />
//         <ConversationThread
//           activeUser={activeUser}
//           channelId={activeConversation.id}
//           messages={threadMessages}
//         />
//       )} */}

//       <ConversationThread
//         activeUser={activeUser}
//         channelId={activeConversation.id}
//         messages={threadMessages}
//       />
//     </div>
//   );
// }
