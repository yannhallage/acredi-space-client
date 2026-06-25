import { Link } from "react-router-dom";

import type { User } from "../../../../shared/types";
import { Icon } from "../../../../shared/ui";
import { initials } from "../../utils";
import { EmptyBlock } from "./EmptyBlock";
import { ListSkeleton } from "../skeletons/DashboardSkeletons";

function PersonBadge({ user }: { user: User }) {
  const online = user.presence !== "offline";

  return (
    <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#8C4B35] text-[11px] font-semibold text-white">
      {initials(user.name)}
      <span
        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--surface)] ${
          online ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
    </span>
  );
}

type PeopleListProps = {
  emptyTitle: string;
  isLoading: boolean;
  users: User[];
};

export function PeopleList({ emptyTitle, isLoading, users }: PeopleListProps) {
  if (isLoading) return <ListSkeleton />;

  const items = users.slice(0, 5);

  if (!items.length) {
    return <EmptyBlock title={emptyTitle} body="Aucun membre en ligne pour le moment." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((person) => (
        <li className="flex min-w-0 items-center gap-2.5" key={person.id}>
          <PersonBadge user={person} />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-semibold text-[var(--text)]">{person.name}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">{person.status || person.role}</small>
          </span>
          <Link
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            to={`/app/dm/dm-${person.name.split(" ")[0]?.toLowerCase() ?? person.id}`}
            aria-label={`Message ${person.name}`}
          >
            <Icon name="message" size={13} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
