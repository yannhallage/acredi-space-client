import {
  formatDiscussionMemberName,
  type GroupDiscussionMemberResponse,
  type GroupDiscussionResponse,
} from "../../../../shared/api/discussions";
import { Avatar, Icon } from "../../../../shared/ui";

import { formatMessageTime } from "../../utils/messageFormat";

interface ChatDetailsPanelProps {
  members: GroupDiscussionMemberResponse[];
  activeDiscussion: GroupDiscussionResponse;
  discussionDetail?: GroupDiscussionResponse | null;
  currentUserId?: string;
  getUserAvatarUrl: (userId: string) => string | null | undefined;
}

export function ChatDetailsPanel({
  members,
  activeDiscussion,
  discussionDetail,
  currentUserId,
  getUserAvatarUrl,
}: ChatDetailsPanelProps) {
  return (
    <aside className="details-panel">
      <header>
        <strong>Details de la discussion</strong>
        <Icon name="moreH" size={16} />
      </header>

      <section>
        <p className="section-label">Participants</p>
        <ul className="people-list compact">
          {members.length ? (
            members.map((member) => {
              const memberName = formatDiscussionMemberName(member);
              const isCurrentUser = currentUserId === member.userId;

              return (
                <li key={member.userId}>
                  <Avatar
                    name={memberName}
                    size={24}
                    src={getUserAvatarUrl(member.userId)}
                  />
                  <span>
                    <strong>{memberName}</strong>
                    <small>
                      {isCurrentUser
                        ? "Vous"
                        : member.roleName || member.email || "Collaborateur"}
                    </small>
                  </span>
                </li>
              );
            })
          ) : (
            <li>
              <span className="muted">Aucun participant charge.</span>
            </li>
          )}
        </ul>
      </section>

      <section>
        <p className="section-label">Informations</p>
        <p className="muted">
          Discussion de groupe
          {discussionDetail?.createdAt || activeDiscussion.createdAt
            ? ` creee le ${formatMessageTime(
                discussionDetail?.createdAt ?? activeDiscussion.createdAt,
              )}.`
            : "."}
        </p>

        {discussionDetail?.description || activeDiscussion.description ? (
          <p className="muted">
            {discussionDetail?.description ?? activeDiscussion.description}
          </p>
        ) : null}
      </section>
    </aside>
  );
}
