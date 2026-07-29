import type { User } from "../../../../shared/types";
import type { WidgetComponentProps } from "../../constants";
import { onlineUsers, ratioPercent } from "../../utils";
import { PeopleList } from "./PeopleList";

export function OnlineTeamMembersWidget({ context }: WidgetComponentProps) {
  const members = context.teamMembers
    .map((member) => member.user)
    .filter((user): user is User => Boolean(user))
    .filter((user) => user.presence !== "offline");

  return (
    <PeopleList emptyTitle="Aucun membre en ligne" isLoading={context.isTeamMembersLoading} users={members} />
  );
}

export function OnlineColleaguesWidget({ context }: WidgetComponentProps) {
  const members = context.teamMembers
    .map((member) => member.user)
    .filter((user): user is User => Boolean(user));
  const source = members.length ? members : context.users;

  return (
    <PeopleList
      emptyTitle="Aucun collegue en ligne"
      isLoading={context.isTeamMembersLoading || context.isUsersLoading}
      users={onlineUsers(source)}
    />
  );
}

export function TeamActivityWidget({ context }: WidgetComponentProps) {
  const teamFiles = context.files.filter((file) => Boolean(file.teamId)).length;
  const teamNotes = context.notes.filter((note) => Boolean(note.teamId)).length;
  const teamMeetings = context.meetings.filter((meeting) => Boolean(meeting.teamId)).length;
  const max = Math.max(teamFiles, teamNotes, teamMeetings, 1);
  const rows = [
    { label: "Fichiers equipe", value: teamFiles },
    { label: "Notes equipe", value: teamNotes },
    { label: "Reunions equipe", value: teamMeetings },
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div className="space-y-2" key={row.label}>
          <div className="flex items-center justify-between gap-4">
            <span className="truncate text-[12px] font-semibold text-[var(--text)]">{row.label}</span>
            <span className="shrink-0 text-[11px] text-[var(--muted)]">{row.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full rounded-full bg-[#5B6CFF]" style={{ width: `${ratioPercent(row.value, max)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
