import { useTeamsQuery } from "../../shared/api/teams";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ForwardMessageModal } from "./components/modals/ForwardMessageModal";
import {
  DmDeleteMessageModal,
  DmEditMessageModal,
} from "./components/modals/DmMessageActionModals";

import {
  useChannelsQuery,
  useChannelMessagesSocket,
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

  const [messageToEdit, setMessageToEdit] =
    useState<MessageResponse | null>(null);

  const [messageToDelete, setMessageToDelete] =
    useState<MessageResponse | null>(null);

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

    (usersQuery.data ?? []).forEach((item) => {
      map.set(item.name.toLowerCase(), item);
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

  const { typingUsers, publishTyping } = useChannelMessagesSocket(
    directChannelIds,
    activeConversationId || selectedConversationId || null,
  );

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
    setMessageToEdit(null);
    setMessageToDelete(null);
    setForwardModalOpen(false);
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

  function clearMessageSelection() {
    setSelectedMessages([]);
  }

  function handleForwardMessage(message: MessageResponse) {
    if (message.deleted) {
      return;
    }

    setSelectedMessages([message]);
    setForwardModalOpen(true);
  }

  function handleEditMessage(message: MessageResponse) {
    if (message.senderId !== currentUserId) {
      alert("Tu ne peux modifier que tes propres messages.");
      return;
    }

    if (message.deleted) {
      alert("Impossible de modifier un message supprimé.");
      return;
    }

    setMessageToEdit(message);
  }

  function handleConfirmEditMessage(content: string) {
    if (!messageToEdit) {
      return;
    }

    updateMessageMutation.mutate(
      {
        messageId: messageToEdit.id,
        content,
      },
      {
        onSuccess: () => {
          setMessageToEdit(null);

          if (activeConversationId) {
            void refetchMessages();
          }

          void refetchChannels();
        },
        onError: (error) => {
          console.error("Erreur modification message", error);
          alert("Impossible de modifier le message.");
        },
      }
    );
  }

  function handleDeleteMessage(message: MessageResponse) {
    if (message.senderId !== currentUserId) {
      alert("Tu ne peux supprimer que tes propres messages.");
      return;
    }

    if (message.deleted) {
      alert("Ce message est déjà supprimé.");
      return;
    }

    setMessageToDelete(message);
  }

  async function handleConfirmDeleteMessage() {
    if (!messageToDelete) {
      return;
    }

    try {
      await deleteMessageMutation.mutateAsync({
        messageId: messageToDelete.id,
      });

      setMessageToDelete(null);

      if (activeConversationId) {
        await refetchMessages();
      }

      await refetchChannels();
    } catch (error) {
      console.error("Erreur suppression message", error);
      alert("Impossible de supprimer le message.");
    }
  }

  const isRefreshingDiscussion =
    (channelsFetching && !channelsLoading) ||
    (messagesFetching && !messagesLoading);

  const threadSubtitle = activeParticipant?.role ?? "Message direct";

  const threadProps = activeConversation
    ? {
        channelId: activeConversation.id,
        title: getChannelDisplayName(activeConversation),
        subtitle: threadSubtitle,
        presence: activeParticipant?.presence ?? ("offline" as const),
        avatarUrl: activeParticipant?.avatarUrl,
        contact: activeParticipant,
        messages,
        loading: messagesLoading,
        refreshing: isRefreshingDiscussion,
        typingUsers,
        publishTyping,
        onRefresh: handleRefreshDiscussion,

        currentUserId,
        onForwardMessage: handleForwardMessage,
        onEditMessage: handleEditMessage,
        onDeleteMessage: handleDeleteMessage,
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
        onClose={() => {
          setForwardModalOpen(false);
          clearMessageSelection();
        }}
        onConfirm={(payload) => {
          if (
            !payload.targetUserIds.length &&
            !payload.targetChannelIds.length &&
            !payload.targetTeamIds.length
          ) {
            alert("Choisis au moins un destinataire.");
            return;
          }

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

      <DmEditMessageModal
        open={Boolean(messageToEdit)}
        message={messageToEdit}
        submitting={updateMessageMutation.isPending}
        onClose={() => setMessageToEdit(null)}
        onConfirm={handleConfirmEditMessage}
      />

      <DmDeleteMessageModal
        open={Boolean(messageToDelete)}
        message={messageToDelete}
        submitting={deleteMessageMutation.isPending}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleConfirmDeleteMessage}
      />
    </div>
  );
}