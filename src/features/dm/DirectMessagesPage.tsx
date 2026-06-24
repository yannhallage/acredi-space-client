import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useChannelsQuery,
  useMessagesQueries,
  useMessagesQuery,
} from "../../shared/api/dm/hooks";
import type { ChannelResponse, MessageResponse } from "../../shared/api/dm/types";
import { useUsersQuery } from "../../shared/api/users";
import type { User } from "../../shared/types";

import { DirectConversationList } from "./components/ConversationList";
import { DirectConversationThread } from "./components/ConversationThread";
import { DirectConversationEmpty } from "./components/DirectConversationEmpty";
import { DmPageSkeleton } from "./components/DmSkeletons";

import "./direct-messages.css";

function getChannelDisplayName(channel?: ChannelResponse | null) {
  if (!channel) return "Conversation";
  if (channel.displayName) return channel.displayName;
  if (channel.name) return channel.name;
  if (channel.privateChannel) return "Discussion privée";

  return "Conversation";
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

export function DirectMessagesPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [selectedConversationId, setSelectedConversationId] = useState(
    conversationId ?? ""
  );

  const {
    data: channels = [],
    isLoading: channelsLoading,
    isError: channelsError,
    isFetching: channelsFetching,
    refetch: refetchChannels,
  } = useChannelsQuery();

  const usersQuery = useUsersQuery();

  const directChannels = useMemo(
    () => channels.filter((channel) => channel.privateChannel),
    [channels]
  );

  const directChannelIds = useMemo(
    () => directChannels.map((channel) => channel.id),
    [directChannels]
  );

  const channelMessagesQueries = useMessagesQueries(directChannelIds);

  const latestMessagesByChannelId = useMemo(() => {
    return channelMessagesQueries.reduce<Record<string, MessageResponse>>(
      (messagesByChannelId, query, index) => {
        const channelId = directChannelIds[index];
        const latestMessage = getLatestMessage(query.data ?? []);

        if (channelId && latestMessage) {
          messagesByChannelId[channelId] = latestMessage;
        }

        return messagesByChannelId;
      },
      {}
    );
  }, [channelMessagesQueries, directChannelIds]);

  const usersByName = useMemo(() => {
    const map = new Map<string, User>();

    (usersQuery.data ?? []).forEach((user) => {
      map.set(user.name.toLowerCase(), user);
    });

    return map;
  }, [usersQuery.data]);

  const activeConversation = useMemo(() => {
    if (!selectedConversationId) return null;

    return (
      directChannels.find((channel) => channel.id === selectedConversationId) ??
      null
    );
  }, [directChannels, selectedConversationId]);

  const activeConversationId = activeConversation?.id ?? "";

  const {
    data: messages = [],
    isLoading: messagesLoading,
    isFetching: messagesFetching,
    refetch: refetchMessages,
  } = useMessagesQuery(activeConversationId);

  const activeParticipant = useMemo(() => {
    if (!activeConversation) return null;

    const displayName = getChannelDisplayName(activeConversation);
    return usersByName.get(displayName.toLowerCase()) ?? null;
  }, [activeConversation, usersByName]);

  useEffect(() => {
    setSelectedConversationId(conversationId ?? "");
  }, [conversationId]);

  function handleSelectConversation(nextConversationId: string) {
    setSelectedConversationId(nextConversationId);
    navigate(`/app/dm/${nextConversationId}`);
  }

  function handleConversationCreated(channel: ChannelResponse) {
    setSelectedConversationId(channel.id);
    navigate(`/app/dm/${channel.id}`);
  }

  function handleCloseConversation() {
    setSelectedConversationId("");
    navigate("/app/dm");
  }

  function handleRefreshDiscussion() {
    void Promise.all([
      refetchChannels(),
      activeConversationId ? refetchMessages() : Promise.resolve(),
    ]);
  }

  const isRefreshingDiscussion =
    (channelsFetching && !channelsLoading) ||
    (messagesFetching && !messagesLoading);

  if (channelsLoading) {
    return <DmPageSkeleton />;
  }

  if (channelsError) {
    return (
      <div className="dm-page">
        <div className="dm-error">
          Impossible de charger les conversations.
        </div>
      </div>
    );
  }

  const threadSubtitle = activeParticipant?.role ?? "Message direct";

  // return (
  //   <div className="dm-page">
  //     <DirectConversationList
  //       conversations={directChannels}
  //       users={usersQuery.data ?? []}
  //       activeConversationId={activeConversationId}
  //       activeMessages={messages}
  //       latestMessagesByChannelId={latestMessagesByChannelId}
  //       onSelectConversation={handleSelectConversation}
  //       onConversationCreated={handleConversationCreated}
  //     />

  //     {!activeConversation ? (
  //       <DirectConversationEmpty />
  //     ) : (
  //       <DirectConversationThread
  //         channelId={activeConversation.id}
  //         title={getChannelDisplayName(activeConversation)}
  //         subtitle={threadSubtitle}
  //         presence={activeParticipant?.presence ?? "offline"}
  //         messages={messages}
  //         loading={messagesLoading}
  //         refreshing={isRefreshingDiscussion}
  //         onRefresh={handleRefreshDiscussion}
  //         onClose={handleCloseConversation}
  //       />
  //     )}
  //   </div>
  // );


  return (
  <div
    className={
      activeConversation
        ? "dm-page dm-page-thread-open"
        : "dm-page"
    }
  >
    <div className="dm-list-area">
      <DirectConversationList
        conversations={directChannels}
        users={usersQuery.data ?? []}
        activeConversationId={activeConversationId}
        activeMessages={messages}
        latestMessagesByChannelId={latestMessagesByChannelId}
        onSelectConversation={handleSelectConversation}
        onConversationCreated={handleConversationCreated}
      />
    </div>

    <div className="dm-thread-area">
      {!activeConversation ? (
        <DirectConversationEmpty />
      ) : (
        <DirectConversationThread
          channelId={activeConversation.id}
          title={getChannelDisplayName(activeConversation)}
          subtitle={threadSubtitle}
          presence={activeParticipant?.presence ?? "offline"}
          messages={messages}
          loading={messagesLoading}
          refreshing={isRefreshingDiscussion}
          onRefresh={handleRefreshDiscussion}
          onClose={handleCloseConversation}
        />
      )}
    </div>
  </div>
);
}
