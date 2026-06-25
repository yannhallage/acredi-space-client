import { NavLink } from "react-router-dom";

import {
  formatDiscussionMemberName,
  type GroupDiscussionMemberResponse,
  type GroupDiscussionResponse,
} from "../../../../shared/api/discussions";
import { Avatar, Icon } from "../../../../shared/ui";

import { sidebarSkeletons } from "../skeletons/ChatSidebarSkeleton";

interface ChatSidebarProps {
  members: GroupDiscussionMemberResponse[];
  discussions: GroupDiscussionResponse[];
  discussionDetailLoading: boolean;
  currentUserId?: string;
  getUserAvatarUrl: (userId: string) => string | null | undefined;
}

export function ChatSidebar({
  members,
  discussions,
  discussionDetailLoading,
  currentUserId,
  getUserAvatarUrl,
}: ChatSidebarProps) {
  return (
    <aside className="chat-sidebar">
      <label className="mini-search">
        <Icon name="search" size={14} />
        <input placeholder="Rechercher..." />
      </label>

      <p className="section-label split dm-section-label">
        <span>Membres du groupe</span>
      </p>

      <nav className="chat-nav dm-nav">
        {discussionDetailLoading && !members.length ? (
          sidebarSkeletons.slice(0, 3).map((item) => (
            <div className="chat-nav-item-skeleton" key={item}>
              <span className="skeleton-avatar" />
              <span className="skeleton-line chat-skeleton-nav-name" />
            </div>
          ))
        ) : members.length ? (
          members.map((member) => {
            const memberName = formatDiscussionMemberName(member);
            const isCurrentUser = currentUserId === member.userId;

            return (
              <div className="chat-nav-item static" key={member.userId}>
                <Avatar
                  name={memberName}
                  size={20}
                  src={getUserAvatarUrl(member.userId)}
                />
                <span>
                  {isCurrentUser ? `${memberName} (Vous)` : memberName}
                </span>
                <span className="dm-presence presence-offline" />
              </div>
            );
          })
        ) : (
          <p className="muted chat-sidebar-empty">Aucun membre charge.</p>
        )}
      </nav>

      <p className="section-label split dm-section-label">
        <span>Discussions</span>
      </p>

      <nav className="chat-nav dm-nav">
        {discussions.map((discussion) => (
          <NavLink key={discussion.id} to={`/app/chat/${discussion.id}`}>
            <span
              className="discussion-dot"
              style={{
                background: discussion.teamColor ?? "#6366F1",
              }}
            />
            <span>{discussion.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
