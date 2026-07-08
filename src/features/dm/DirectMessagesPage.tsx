import { useTeamsQuery } from "../../shared/api/teams";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ForwardMessageModal } from "./components/modals/ForwardMessageModal";
import {
  useChannelsQuery,
  useMessagesQueries,
  useMessagesQuery,
  useForwardMessagesMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
} from "../../shared/api/dm/hooks";
import type { ChannelResponse, MessageResponse } from "../../shared/api/dm/types";
import { useUsersQuery } from "../../shared/api/users";
import type { User } from "../../shared/types";
import { useAuth } from "../../shared/context";

import {
  DirectConversationEmpty,
  DirectConversationDrawer,
  DirectConversationList,
  DirectConversationThread,
  DmPageSkeleton,
} from "./components";
import { useDmMobileLayout } from "./hooks/useDmMobileLayout";

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
  const isMobileLayout = useDmMobileLayout();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";
  
  const [selectedConversationId, setSelectedConversationId] = useState(
    conversationId ?? ""
  );
  const [selectedMessages, setSelectedMessages] = useState<MessageResponse[]>([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);

  const {
    data: channels = [],
    isLoading: channelsLoading,
    isError: channelsError,
    isFetching: channelsFetching,
    refetch: refetchChannels,
  } = useChannelsQuery();

  const usersQuery = useUsersQuery();
  const teamsQuery = useTeamsQuery();
  const forwardMessagesMutation = useForwardMessagesMutation();
  const updateMessageMutation = useUpdateMessageMutation();
  const deleteMessageMutation = useDeleteMessageMutation();

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

  // const forwardTargets = useMemo(() => {
  //   const userTargets = (usersQuery.data ?? [])
  //     .filter((targetUser) => targetUser.id !== currentUserId)
  //     .map((targetUser) => ({
  //       id: targetUser.id,
  //       name: targetUser.name,
  //       type: "user" as const,
  //     }));

  //   const channelTargets = directChannels
  //     .filter((channel) => channel.id !== activeConversationId)
  //     .map((channel) => ({
  //       id: channel.id,
  //       name: getChannelDisplayName(channel),
  //       type: "channel" as const,
  //     }));

  //   return [...userTargets, ...channelTargets];
  // }, [usersQuery.data, directChannels, activeConversationId, currentUserId]);



const forwardTargets = useMemo(() => {
  const userTargets = (usersQuery.data ?? [])
    .filter((targetUser) => targetUser.id !== currentUserId)
    .map((targetUser) => ({
      id: targetUser.id,
      name: targetUser.name,
      type: "user" as const,
    }));
const teamTargets = (teamsQuery.data ?? []).map((team) => ({
  id: team.id,
  name: team.name,
  type: "team" as const,
}));

  return [...userTargets, ...teamTargets];
}, [usersQuery.data, teamsQuery.data, currentUserId]);




  useEffect(() => {
    setSelectedConversationId(conversationId ?? "");
  }, [conversationId]);

  useEffect(() => {
    setSelectedMessages([]);
  }, [activeConversationId]);

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

  function toggleMessageSelection(message: MessageResponse) {
    setSelectedMessages((current) => {
      const alreadySelected = current.some((item) => item.id === message.id);

      if (alreadySelected) {
        return current.filter((item) => item.id !== message.id);
      }

      return [...current, message];
    });
  }

  function clearMessageSelection() {
    setSelectedMessages([]);
  }

  const isRefreshingDiscussion =
    (channelsFetching && !channelsLoading) ||
    (messagesFetching && !messagesLoading);

  const threadSubtitle = activeParticipant?.role ?? "Message direct";




  function handleEditSelectedMessage() {
  if (selectedMessages.length !== 1) {
    alert("Sélectionne un seul message à modifier.");
    return;
  }

  const message = selectedMessages[0];

  if (message.senderId !== currentUserId) {
    alert("Tu ne peux modifier que tes propres messages.");
    return;
  }

  if (message.deleted) {
    alert("Impossible de modifier un message supprimé.");
    return;
  }

  const nextContent = window.prompt(
    "Modifier le message",
    message.content ?? ""
  );

  if (nextContent === null) {
    return;
  }

  const trimmedContent = nextContent.trim();

  if (!trimmedContent) {
    alert("Le message ne peut pas être vide.");
    return;
  }

  updateMessageMutation.mutate(
    {
      messageId: message.id,
      content: trimmedContent,
    },
    {
      onSuccess: () => {
        clearMessageSelection();

        if (activeConversationId) {
          void refetchMessages();
        }

        void refetchChannels();
      },
      onError: (error) => {
        console.error("Erreur modification message", error);
      },
    }
  );
}
async function handleDeleteSelectedMessages() {
  if (!selectedMessages.length) {
    return;
  }

  const notOwnedMessage = selectedMessages.find(
    (message) => message.senderId !== currentUserId
  );

  if (notOwnedMessage) {
    alert("Tu ne peux supprimer que tes propres messages.");
    return;
  }

  const confirmed = window.confirm(
    selectedMessages.length === 1
      ? "Supprimer ce message ?"
      : `Supprimer ${selectedMessages.length} messages ?`
  );

  if (!confirmed) {
    return;
  }

  try {
    for (const message of selectedMessages) {
      await deleteMessageMutation.mutateAsync({
        messageId: message.id,
      });
    }

    clearMessageSelection();

    if (activeConversationId) {
      await refetchMessages();
    }

    await refetchChannels();
  } catch (error) {
    console.error("Erreur suppression message", error);
    alert("Impossible de supprimer le message.");
  }
}


  const threadProps = activeConversation
    ? {
        channelId: activeConversation.id,
        title: getChannelDisplayName(activeConversation),
        subtitle: threadSubtitle,
        presence: activeParticipant?.presence ?? ("offline" as const),
        avatarUrl: activeParticipant?.avatarUrl,
        messages,
        loading: messagesLoading,
        refreshing: isRefreshingDiscussion,
        onRefresh: handleRefreshDiscussion,

        selectedMessages,
        currentUserId,
        onToggleMessageSelection: toggleMessageSelection,
        onClearMessageSelection: clearMessageSelection,
        onForwardSelectedMessages: () => {
          setForwardModalOpen(true);
        },
        onEditSelectedMessage: handleEditSelectedMessage,
        onDeleteSelectedMessages: handleDeleteSelectedMessages,
      }
    : null;

  if (channelsLoading) {
    return <DmPageSkeleton />;
  }

  if (channelsError) {
    return (
      <div className="dm-page">
        <div className="dm-error">Impossible de charger les conversations.</div>
      </div>
    );
  }

  return (
    <div className="dm-page">
      <DirectConversationList
        conversations={directChannels}
        users={usersQuery.data ?? []}
        activeConversationId={activeConversationId}
        activeMessages={messages}
        latestMessagesByChannelId={latestMessagesByChannelId}
        onSelectConversation={handleSelectConversation}
        onConversationCreated={handleConversationCreated}
      />

      {isMobileLayout ? (
        <DirectConversationDrawer
          isOpen={Boolean(activeConversation && threadProps)}
          title={threadProps?.title ?? "Conversation"}
          onClose={handleCloseConversation}
        >
          {threadProps ? (
            <DirectConversationThread
              {...threadProps}
              showBackButton
              onClose={handleCloseConversation}
            />
          ) : null}
        </DirectConversationDrawer>
      ) : !activeConversation ? (
        <DirectConversationEmpty />
      ) : threadProps ? (
        <DirectConversationThread {...threadProps} />
      ) : null}

  <ForwardMessageModal
  open={forwardModalOpen}
  selectedMessagesCount={selectedMessages.length}
  targets={forwardTargets}
  onClose={() => setForwardModalOpen(false)}
  onConfirm={(payload) => {
    // const rawPayload = payload as {
    //   targetUserIds?: string[];
    //   targetChannelIds?: string[];
    //   targets?: Array<{
    //     id: string;
    //     type: "user" | "channel";
    //   }>;
    // };

    // const targetUserIds =
    //   rawPayload.targetUserIds ??
    //   rawPayload.targets
    //     ?.filter((target) => target.type === "user")
    //     .map((target) => target.id) ??
    //   [];

    // const targetChannelIds =
    //   rawPayload.targetChannelIds ??
    //   rawPayload.targets
    //     ?.filter((target) => target.type === "channel")
    //     .map((target) => target.id) ??
    //   [];
      
   forwardMessagesMutation.mutate(
  {
    sourceType: "CHAT",
    sourceMessageIds: selectedMessages.map((message) => message.id),
    targetUserIds: payload.targetUserIds,
    targetChannelIds: payload.targetChannelIds,
    targetTeamIds: payload.targetTeamIds,
  },
  {
    onSuccess: () => {
      setForwardModalOpen(false);
      clearMessageSelection();

      void refetchChannels();

      if (activeConversationId) {
        void refetchMessages();
      }
    },
    onError: (error) => {
      console.error("Erreur transfert message", error);
    },
  }
);
  }}
/>
    </div>
  );
}