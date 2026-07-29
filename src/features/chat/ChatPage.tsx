import { EmptyState } from "../../shared/ui";

import {
  ChatComposer,
  ChatDetailsPanel,
  ChatDiscussionDrawer,
  ChatPageSkeleton,
  ChatSidebar,
  ChatThread,
} from "./components";
import { useChatPage } from "./hooks/useChatPage";

export function ChatPage() {
  const page = useChatPage();

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

  if (!page.isMobileLayout && !page.activeDiscussion) {
    return <ChatPageSkeleton />;
  }

  const thread = page.activeDiscussion ? (
    <ChatThread
      discussionId={page.activeDiscussion.id}
      discussionName={page.discussionName}
      teamName={page.teamName}
      messagesLoading={page.messagesLoading}
      messagesError={page.messagesError}
      messagesErrorDetails={page.messagesErrorDetails}
      messagesFetching={page.messagesFetching}
      messageGroups={page.messageGroups}
      messageListRef={page.messageListRef}
      getUserAvatarUrl={page.getUserAvatarUrl}
      typingLabel={page.typingLabel}
      showBackButton={page.isMobileLayout}
      onClose={page.handleCloseDiscussion}
      onEditMessage={page.handleEditMessage}
      onDeleteMessage={page.handleDeleteMessage}
      composer={
        <ChatComposer
          discussionName={page.discussionName}
          draft={page.draft}
          selectedFile={page.selectedFile}
          emojiOpen={page.emojiOpen}
          uploadingFile={page.uploadingFile}
          sendError={page.sendError}
          sendPending={page.sendPending}
          isEditing={page.isEditing}
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
          onCancelEdit={page.handleCancelEdit}
        />
      }
    />
  ) : null;

  return (
    <div className="chat-page">
      <ChatSidebar
        members={page.members}
        discussions={page.discussions}
        discussionDetailLoading={page.discussionDetailLoading}
        currentUserId={page.currentUserId}
        getUserAvatarUrl={page.getUserAvatarUrl}
      />

      {page.isMobileLayout ? (
        <ChatDiscussionDrawer
          isOpen={Boolean(page.activeDiscussion)}
          title={page.discussionName || "Discussion"}
          onClose={page.handleCloseDiscussion}
        >
          {thread}
        </ChatDiscussionDrawer>
      ) : (
        <>
          {thread}
          {page.activeDiscussion ? (
            <ChatDetailsPanel
              members={page.members}
              activeDiscussion={page.activeDiscussion}
              discussionDetail={page.discussionDetail}
              currentUserId={page.currentUserId}
              getUserAvatarUrl={page.getUserAvatarUrl}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
