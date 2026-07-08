import { useMemo, useState } from "react";
import { EmptyState } from "../../shared/ui";

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
export function ChatPage() {
  const page = useChatPage();

  const usersQuery = useUsersQuery();
  const teamsQuery = useTeamsQuery();
  const forwardMessagesMutation = useForwardMessagesMutation();
  const updateDiscussionMessageMutation = useUpdateDiscussionMessage();
  const deleteDiscussionMessageMutation = useDeleteDiscussionMessage();

  const [selectedMessages, setSelectedMessages] = useState<any[]>([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);

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

  function toggleMessageSelection(message: any) {
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

  function handleEditSelectedMessage() {
  const message = selectedMessages[0];

  if (!message || !page.activeDiscussion?.id) {
    return;
  }

  if (selectedMessages.length !== 1) {
    alert("Sélectionne un seul message à modifier.");
    return;
  }

  if (message.senderId !== page.currentUserId) {
    alert("Tu ne peux modifier que tes propres messages.");
    return;
  }

  if (message.deleted) {
    alert("Impossible de modifier un message supprimé.");
    return;
  }

  const newContent = window.prompt("Modifier le message", message.content);

  if (newContent === null) {
    return;
  }

  const content = newContent.trim();

  if (!content) {
    alert("Le message ne peut pas être vide.");
    return;
  }

  updateDiscussionMessageMutation.mutate(
    {
      discussionId: page.activeDiscussion.id,
      messageId: message.id,
      request: { content },
    },
    {
      onSuccess: () => {
        clearMessageSelection();
      },
      onError: (error) => {
        console.error("Erreur modification message groupe", error);
        alert("Impossible de modifier le message.");
      },
    }
  );
}

async function handleDeleteSelectedMessages() {
  if (!page.activeDiscussion?.id || !selectedMessages.length) {
    return;
  }

  const deletableMessages = selectedMessages.filter(
    (message) => message.senderId === page.currentUserId && !message.deleted
  );

  if (!deletableMessages.length) {
    alert("Tu ne peux supprimer que tes propres messages non supprimés.");
    return;
  }

  const confirmed = window.confirm(
    deletableMessages.length === 1
      ? "Supprimer ce message ?"
      : `Supprimer ${deletableMessages.length} messages ?`
  );

  if (!confirmed) {
    return;
  }

  try {
    await Promise.all(
      deletableMessages.map((message) =>
        deleteDiscussionMessageMutation.mutateAsync({
          discussionId: page.activeDiscussion.id,
          messageId: message.id,
        })
      )
    );

    clearMessageSelection();
  } catch (error) {
    console.error("Erreur suppression message groupe", error);
    alert("Impossible de supprimer le message.");
  }
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
        selectedMessages={selectedMessages}
        currentUserId={page.currentUserId}
        onToggleMessageSelection={toggleMessageSelection}
        onClearMessageSelection={clearMessageSelection}
        onForwardSelectedMessages={() => {
          if (!selectedMessages.length) {
            return;
          }

          setForwardModalOpen(true);
        }}
       onEditSelectedMessage={handleEditSelectedMessage}
onDeleteSelectedMessages={handleDeleteSelectedMessages}
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
        onClose={() => setForwardModalOpen(false)}
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
              },
            }
          );
        }}
      />
    </div>
  );
}