import { AnimatePresence, motion } from "framer-motion";

import { Avatar } from "../../../shared/ui";

export type MentionMemberOption = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
};

export function getMentionContext(
  value: string,
  cursor: number,
): { query: string; start: number } | null {
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/(^|[\s\n])@([^\s@]*)$/);

  if (!match) {
    return null;
  }

  return {
    query: match[2],
    start: beforeCursor.lastIndexOf("@"),
  };
}

export function insertMention(
  value: string,
  start: number,
  cursor: number,
  memberName: string,
) {
  const before = value.slice(0, start);
  const after = value.slice(cursor);
  const mention = `@${memberName} `;
  const nextValue = `${before}${mention}${after}`;
  const nextCursor = before.length + mention.length;

  return { nextValue, nextCursor };
}

export function filterMentionMembers(
  members: MentionMemberOption[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return members;
  }

  return members.filter((member) =>
    member.name.toLowerCase().includes(normalizedQuery),
  );
}

interface MentionSuggestionsProps {
  activeIndex: number;
  members: MentionMemberOption[];
  onHover: (index: number) => void;
  onSelect: (member: MentionMemberOption) => void;
  open: boolean;
}

export function MentionSuggestions({
  activeIndex,
  members,
  onHover,
  onSelect,
  open,
}: MentionSuggestionsProps) {
  return (
    <AnimatePresence>
      {open && members.length ? (
        <motion.div
          className="chat-mention-dropdown"
          role="listbox"
          aria-label="Mentionner un membre"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          {members.map((member, index) => (
            <button
              key={member.userId}
              className={
                index === activeIndex
                  ? "chat-mention-item active"
                  : "chat-mention-item"
              }
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              onMouseEnter={() => onHover(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(member)}
            >
              <Avatar name={member.name} size={32} src={member.avatarUrl} />
              <span className="chat-mention-copy">
                <strong>{member.name}</strong>
                {member.isCurrentUser ? <small>Vous</small> : null}
              </span>
            </button>
          ))}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
