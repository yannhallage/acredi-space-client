import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../shared/ui";

import {
  GroupDeleteMessageModal,
  GroupEditMessageModal,
  GroupMessageErrorModal,
} from "./components/GroupMessageActionModals";

import {
  ChatComposer,
  ChatDetailsPanel,
  ChatPageSkeleton,
  ChatSidebar,
  ChatThread,
} from "./components";

import { useChatPage } from "./hooks/useChatPage";
import { ForwardMessageModal } from "../dm/components/modals/ForwardMessageModal";
import { useForwardMessagesMutation } from "../../shared/api/dm/hooks";
import { useUsersQuery } from "../../shared/api/users/hooks";
import { useTeamsQuery } from "../../shared/api/teams/hooks";
import {
  useDeleteDiscussionMessage,
  useUpdateDiscussionMessage,
} from "../../shared/api/discussions/hooks";
import type { LocalGroupMessage } from "./utils/messageFormat";

export function ChatPage() {
  const page = useChatPage();

  const usersQuery = useUsersQuery();
  const teamsQuery = useTeamsQuery();

  const forwardMessagesMutation = useForwardMessagesMutation();
  const updateDiscussionMessageMutation = useUpdateDiscussionMessage();
  const deleteDiscussionMessageMutation = useDeleteDiscussionMessage();

  const [selectedMessages, setSelectedMessages] = useState<LocalGroupMessage[]>([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);

  const [messageToEdit, setMessageToEdit] =
    useState<LocalGroupMessage | null>(null);

  const [messageToDelete, setMessageToDelete] =
    useState<LocalGroupMessage | null>(null);

  const [groupActionError, setGroupActionError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMessages([]);
    setForwardModalOpen(false);
    setMessageToEdit(null);
    setMessageToDelete(null);
    setGroupActionError(null);
  }, [page.activeDiscussion?.id]);

  const forwardTargets = useMemo(() => {
    const userTargets = (usersQuery.data ?? [])
      .filter((targetUser: any) => targetUser.id !== page.currentUserId)
      .map((targetUser: any) => ({
        id: targetUser.id,
        name:
          targetUser.name ??
          `${targetUser.firstName ?? ""} ${targetUser.lastName ?? ""}`.trim() ??
          targetUser.email ??
          "Utilisateur",
        type: "user" as const,
      }));

    const teamTargets = (teamsQuery.data ?? []).map((team: any) => ({
      id: team.id,
      name: team.name,
      type: "team" as const,
    }));

    return [...userTargets, ...teamTargets];
  }, [usersQuery.data, teamsQuery.data, page.currentUserId]);

  function clearMessageSelection() {
    setSelectedMessages([]);
  }

  function handleForwardMessage(message: LocalGroupMessage) {
    if (message.deleted) {
      return;
    }

    setSelectedMessages([message]);
    setForwardModalOpen(true);
  }

  function handleEditMessage(message: LocalGroupMessage) {
    if (!page.activeDiscussion?.id) {
      return;
    }

    if (message.senderId !== page.currentUserId) {
      setGroupActionError("Tu ne peux modifier que tes propres messages.");
      return;
    }

    if (message.deleted) {
      setGroupActionError("Impossible de modifier un message supprimé.");
      return;
    }

    setMessageToEdit(message);
  }

  function handleConfirmEditMessage(content: string) {
    if (!messageToEdit || !page.activeDiscussion?.id) {
      return;
    }

    updateDiscussionMessageMutation.mutate(
      {
        discussionId: page.activeDiscussion.id,
        messageId: messageToEdit.id,
        request: { content },
      },
      {
        onSuccess: (updatedMessage) => {
          page.replaceLocalMessage(updatedMessage);
          void page.refetchMessages();
          setMessageToEdit(null);
        },
        onError: (error) => {
          console.error("Erreur modification message groupe", error);
          setGroupActionError(
            "La modification n’a pas pu être effectuée. Réessaie dans un instant."
          );
        },
      }
    );
  }

  function handleDeleteMessage(message: LocalGroupMessage) {
    if (!page.activeDiscussion?.id) {
      return;
    }

    if (message.senderId !== page.currentUserId) {
      setGroupActionError("Tu ne peux supprimer que tes propres messages.");
      return;
    }

    if (message.deleted) {
      setGroupActionError("Ce message est déjà supprimé.");
      return;
    }

    setMessageToDelete(message);
  }

  async function handleConfirmDeleteMessage() {
    if (!messageToDelete || !page.activeDiscussion?.id) {
      return;
    }

    let deletedMessage: LocalGroupMessage | null = null;

    try {
      deletedMessage = await deleteDiscussionMessageMutation.mutateAsync({
        discussionId: page.activeDiscussion.id,
        messageId: messageToDelete.id,
      });
    } catch (error) {
      console.error("Erreur suppression message groupe", error);
      setGroupActionError(
        "La suppression n’a pas pu être effectuée. Réessaie dans un instant."
      );
      return;
    }

    setMessageToDelete(null);

    page.replaceLocalMessage(deletedMessage);

    void page.refetchMessages();
  }

  if (page.discussionsLoading) {
    return <ChatPageSkeleton />;
  }

  if (page.discussionsError) {
    return (
      <EmptyState
        title="Impossible de charger les discussions"
        body={
          page.discussionsErrorDetails instanceof Error
            ? page.discussionsErrorDetails.message
            : "Une erreur est survenue."
        }
      />
    );
  }

  if (!page.discussions.length) {
    return (
      <EmptyState
        title="Aucune discussion de groupe"
        body="Aucune discussion n'est disponible pour le moment."
      />
    );
  }

  if (!page.activeDiscussion) {
    return <ChatPageSkeleton />;
  }

  if (!page.currentUserId) {
    return <ChatPageSkeleton />;
  }

  return (
    <div className="chat-page">
      <ChatSidebar
        members={page.members}
        discussions={page.discussions}
        discussionDetailLoading={page.discussionDetailLoading}
        currentUserId={page.currentUserId}
        getUserAvatarUrl={page.getUserAvatarUrl}
      />

      <ChatThread
        discussionName={page.discussionName}
        teamName={page.teamName}
        messagesLoading={page.messagesLoading}
        messagesError={page.messagesError}
        messagesErrorDetails={page.messagesErrorDetails}
        messagesFetching={page.messagesFetching}
        messageGroups={page.messageGroups}
        messageListRef={page.messageListRef}
        getUserAvatarUrl={page.getUserAvatarUrl}
        currentUserId={page.currentUserId}
        onForwardMessage={handleForwardMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        composer={
          <ChatComposer
            discussionName={page.discussionName}
            draft={page.draft}
            selectedFile={page.selectedFile}
            emojiOpen={page.emojiOpen}
            uploadingFile={page.uploadingFile}
            sendError={page.sendError}
            sendPending={page.sendPending}
            mentionActiveIndex={page.mentionActiveIndex}
            filteredMentionMembers={page.filteredMentionMembers}
            mentionDropdownOpen={page.mentionDropdownOpen}
            textareaRef={page.textareaRef}
            fileInputRef={page.fileInputRef}
            onSubmit={page.handleSubmit}
            onDraftChange={page.handleDraftChange}
            onComposerKeyDown={page.handleComposerKeyDown}
            onSyncMentionContext={page.syncMentionContext}
            onMentionHover={page.setMentionActiveIndex}
            onMentionSelect={page.selectMentionMember}
            onEmojiClick={page.handleEmojiClick}
            onToggleEmoji={page.toggleEmoji}
            onPickFile={page.handlePickFile}
            onFileChange={page.handleFileChange}
            onRemoveSelectedFile={page.removeSelectedFile}
          />
        }
      />

      <ChatDetailsPanel
        members={page.members}
        activeDiscussion={page.activeDiscussion}
        discussionDetail={page.discussionDetail}
        currentUserId={page.currentUserId}
        getUserAvatarUrl={page.getUserAvatarUrl}
      />

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
            setGroupActionError("Choisis au moins un destinataire.");
            return;
          }

          forwardMessagesMutation.mutate(
            {
              sourceType: "GROUP",
              sourceMessageIds: selectedMessages.map((message) => message.id),
              targetUserIds: payload.targetUserIds,
              targetChannelIds: payload.targetChannelIds,
              targetTeamIds: payload.targetTeamIds,
            },
            {
              onSuccess: () => {
                setForwardModalOpen(false);
                clearMessageSelection();
              },
              onError: (error) => {
                console.error("Erreur transfert message groupe", error);
                setGroupActionError(
                  "Le transfert n’a pas pu être effectué. Réessaie dans un instant."
                );
              },
            }
          );
        }}
      />

      <GroupEditMessageModal
        open={Boolean(messageToEdit)}
        message={messageToEdit}
        submitting={updateDiscussionMessageMutation.isPending}
        onClose={() => setMessageToEdit(null)}
        onConfirm={handleConfirmEditMessage}
      />

      <GroupDeleteMessageModal
        open={Boolean(messageToDelete)}
        message={messageToDelete}
        submitting={deleteDiscussionMessageMutation.isPending}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleConfirmDeleteMessage}
      />

      <GroupMessageErrorModal
        open={Boolean(groupActionError)}
        message={groupActionError ?? ""}
        onClose={() => setGroupActionError(null)}
      />
    </div>
  );
}