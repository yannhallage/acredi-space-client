import { Avatar, Icon } from "../../../../shared/ui";
import { memberDisplayName } from "../../teamMemberDisplay";
import type { TeamMember } from "../../types";

export function TeamAvatarStack({
  loading,
  members,
}: {
  loading: boolean;
  members: TeamMember[];
}) {
  if (loading) {
    return (
      <>
        <span className="skeleton-avatar" />
        <span className="skeleton-avatar" />
        <span className="skeleton-avatar" />
      </>
    );
  }

  const users = members
    .map((member) => ({
      id: member.user?.id ?? member.userId,
      name: memberDisplayName(member),
      presence: member.user?.presence,
    }))
    .filter((user) => Boolean(user.id));

  if (users.length === 0) {
    return (
      <span className="team-avatar-empty">
        <Icon name="users" size={13} />
      </span>
    );
  }

  return (
    <>
      {users.slice(0, 4).map((user) => (
        <Avatar
          key={user.id}
          name={user.name}
          presence={user.presence}
          ring="var(--surface)"
          size={34}
        />
      ))}
      {users.length > 4 ? (
        <span className="team-avatar-more">+{users.length - 4}</span>
      ) : null}
    </>
  );
}
