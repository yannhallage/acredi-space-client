import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";

import {
  useDashboardMeetings,
  useDashboardNotifications,
  useDashboardStats,
  useDashboardWidgets,
  type DashboardMeeting,
  type DashboardNotification,
  type DashboardStats,
  type DashboardWidgetConfig,
  type DashboardWidgetType,
} from "../../shared/api/dashboard";
import { useCalendarEvents, type CalendarEvent } from "../../shared/api/callendar";
import { useFiles } from "../../shared/api/files";
import type { WorkspaceFile } from "../../shared/api/files/types";
import { buildMeetingRoomUrl, extractMeetingRoomName } from "../../shared/api/meeting/room";
import { useNotes } from "../../shared/api/notes";
import type { Note } from "../../shared/api/notes/type";
import { useUsersQuery } from "../../shared/api/users";
import { useAuth } from "../../shared/context";
import { PERMISSIONS, usePermissions, type PermissionCode } from "../../shared/permissions";
import type { User } from "../../shared/types";
import { Icon, type IconName } from "../../shared/ui";
import { useMyTeams, useTeamMembers, useTeams } from "../teams/hooks";
import type { Team, TeamMember } from "../teams/types";

const WIDGET_ICON: Record<DashboardWidgetType, IconName> = {
  AUDIT_LOG: "shield",
  FILES: "file",
  GLOBAL_STATS: "grid",
  MEETINGS: "video",
  MY_CALENDAR: "calendar",
  MY_FILES: "file",
  MY_MEETINGS: "video",
  MY_NOTES: "notes",
  MY_NOTIFICATIONS: "bell",
  MY_TEAM: "users",
  NOTES: "notes",
  NOTIFICATIONS: "bell",
  ONLINE_COLLEAGUES: "users",
  ONLINE_TEAM_MEMBERS: "users",
  ONLINE_USERS: "users",
  TEAM_ACTIVITY: "grid",
  TEAM_FILES: "file",
  TEAM_MEETINGS: "video",
  TEAM_NOTES: "notes",
  TEAMS: "building",
  USERS: "user",
};

const WIDGET_REQUIREMENTS: Partial<Record<DashboardWidgetType, PermissionCode[]>> = {
  AUDIT_LOG: [PERMISSIONS.VIEW_AUDIT_LOGS],
  FILES: [PERMISSIONS.VIEW_ALL_FILES],
  MEETINGS: [PERMISSIONS.VIEW_MEETINGS],
  MY_CALENDAR: [PERMISSIONS.VIEW_CALENDAR],
  MY_FILES: [PERMISSIONS.VIEW_OWN_FILES],
  MY_MEETINGS: [PERMISSIONS.VIEW_MEETINGS],
  MY_NOTES: [PERMISSIONS.VIEW_NOTES],
  MY_NOTIFICATIONS: [PERMISSIONS.VIEW_NOTIFICATIONS],
  MY_TEAM: [PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM],
  NOTES: [PERMISSIONS.VIEW_NOTES],
  NOTIFICATIONS: [PERMISSIONS.VIEW_NOTIFICATIONS],
  ONLINE_COLLEAGUES: [PERMISSIONS.CHAT_WITH_COLLABORATORS, PERMISSIONS.VIEW_MY_TEAMS],
  ONLINE_TEAM_MEMBERS: [PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM],
  ONLINE_USERS: [PERMISSIONS.VIEW_ALL_USERS],
  TEAM_ACTIVITY: [PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM],
  TEAM_FILES: [PERMISSIONS.ACCESS_TEAM_FILES],
  TEAM_MEETINGS: [PERMISSIONS.VIEW_MEETINGS],
  TEAM_NOTES: [PERMISSIONS.VIEW_NOTES],
  TEAMS: [PERMISSIONS.VIEW_TEAMS],
  USERS: [PERMISSIONS.VIEW_ALL_USERS],
};

const WIDE_WIDGETS = new Set<DashboardWidgetType>([
  "GLOBAL_STATS",
  "MEETINGS",
  "MY_CALENDAR",
  "MY_MEETINGS",
  "TEAM_ACTIVITY",
  "TEAM_MEETINGS",
  "USERS",
]);

const SKELETON_CARDS = ["card-a", "card-b", "card-c", "card-d", "card-e", "card-f"];
const SKELETON_ROWS = ["row-a", "row-b", "row-c", "row-d", "row-e"];

type DashboardDataContext = {
  calendarEvents: CalendarEvent[];
  files: WorkspaceFile[];
  isCalendarLoading: boolean;
  isFilesLoading: boolean;
  isMeetingsLoading: boolean;
  isNotesLoading: boolean;
  isNotificationsLoading: boolean;
  isStatsLoading: boolean;
  isTeamMembersLoading: boolean;
  isTeamsLoading: boolean;
  isUsersLoading: boolean;
  meetings: DashboardMeeting[];
  myTeams: Team[];
  notes: Note[];
  notifications: DashboardNotification[];
  stats: DashboardStats | null;
  teamMembers: TeamMember[];
  teams: Team[];
  users: User[];
};

type WidgetComponentProps = {
  context: DashboardDataContext;
};

function orderWidgets(widgets: DashboardWidgetConfig[]) {
  return [...widgets].sort((a, b) => a.position - b.position);
}

function widgetHasPermission(
  type: DashboardWidgetType,
  hasAnyPermission: (items: readonly PermissionCode[]) => boolean
) {
  const requirements = WIDGET_REQUIREMENTS[type];
  return !requirements || hasAnyPermission(requirements);
}

function formatDateTime(date: Date | null) {
  if (!date) return "Date a confirmer";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  }).format(date);
}

function getMeetingTarget(meeting: DashboardMeeting) {
  const roomName = meeting.roomName || extractMeetingRoomName(meeting.joinUrl);

  if (roomName) {
    return buildMeetingRoomUrl(roomName);
  }

  return `/app/meeting/${meeting.id}`;
}

function recentFiles(files: WorkspaceFile[]) {
  return [...files]
    .sort((a, b) => {
      const left = a.updatedAt ?? a.createdAt;
      const right = b.updatedAt ?? b.createdAt;
      return (right?.getTime() ?? 0) - (left?.getTime() ?? 0);
    })
    .slice(0, 5);
}

function recentNotes(notes: Note[]) {
  return [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5);
}

function upcomingMeetings(meetings: DashboardMeeting[]) {
  const now = Date.now();

  return meetings
    .filter(
      (meeting) =>
        meeting.status === "LIVE" ||
        (meeting.startsAt !== null && meeting.startsAt.getTime() >= now)
    )
    .sort((a, b) => (a.startsAt?.getTime() ?? 0) - (b.startsAt?.getTime() ?? 0))
    .slice(0, 5);
}

function upcomingCalendarEvents(events: CalendarEvent[]) {
  const now = Date.now();

  return events
    .filter((event) => event.startsAt.getTime() >= now)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 5);
}

function onlineUsers(users: User[]) {
  return users.filter((user) => user.presence !== "offline");
}

function kpiNumber(stats: DashboardStats | null, key: string, fallback = 0) {
  if (!stats || !(key in stats)) return fallback;

  const value = (stats as Record<string, number | undefined>)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function ratioPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function fileExtension(file: WorkspaceFile) {
  const extension = file.name.split(".").pop();
  return extension && extension !== file.name ? extension.slice(0, 4).toUpperCase() : "FILE";
}

function WidgetCard({
  children,
  widget,
}: {
  children: ReactNode;
  widget: DashboardWidgetConfig;
}) {
  return (
    <section
      className={[
        "min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.08)]",
        "transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]",
        WIDE_WIDGETS.has(widget.type) ? "lg:col-span-2" : "",
      ].join(" ")}
    >
      <header className="mb-5 flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="shrink-0 text-[#5B6CFF]" name={WIDGET_ICON[widget.type]} size={15} />
          <h2 className="truncate text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--text)]">
            {widget.label}
          </h2>
        </div>
        <button
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--muted-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          type="button"
          aria-label={`Options ${widget.label}`}
        >
          <Icon name="moreH" size={15} />
        </button>
      </header>
      {children}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-6">
      <header className="flex items-start justify-between gap-5">
        <div className="min-w-0 space-y-2.5">
          <div className="h-2.5 w-32 animate-pulse rounded-full bg-[var(--surface-2)]" />
          <div className="h-6 w-52 animate-pulse rounded-md bg-[var(--surface-2)]" />
          <div className="h-3.5 w-40 animate-pulse rounded-full bg-[var(--surface-2)]" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[var(--surface-2)]" />
      </header>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4 lg:grid-cols-2">
        {SKELETON_CARDS.map((card) => (
          <div className="min-h-[190px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5" key={card}>
            <div className="mb-5 flex items-center justify-between">
              <div className="h-3 w-32 animate-pulse rounded-full bg-[var(--surface-2)]" />
              <div className="h-7 w-7 animate-pulse rounded-md bg-[var(--surface-2)]" />
            </div>
            <ListSkeleton />
          </div>
        ))}
      </section>
    </div>
  );
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {SKELETON_ROWS.slice(0, rows).map((row) => (
        <div className="flex min-w-0 items-center gap-2.5" key={row}>
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--surface-2)]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-[var(--surface-2)]" />
            <div className="h-2.5 w-2/5 animate-pulse rounded-full bg-[var(--surface-2)] opacity-70" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {SKELETON_ROWS.slice(0, 4).map((row) => (
        <div className="rounded-lg bg-[var(--surface-2)] p-4" key={row}>
          <div className="mb-3 h-6 w-12 animate-pulse rounded-md bg-[var(--surface-3)]" />
          <div className="h-2.5 w-20 animate-pulse rounded-full bg-[var(--surface-3)]" />
        </div>
      ))}
    </div>
  );
}

function EmptyBlock({ body, title }: { body: string; title: string }) {
  return (
    <div className="grid min-h-[130px] place-items-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-5 py-5 text-center">
      <div className="space-y-2.5">
        <Icon className="mx-auto text-[var(--muted-soft)]" name="search" size={17} />
        <p className="text-[12px] font-semibold text-[var(--text)]">{title}</p>
        <p className="mx-auto max-w-[240px] text-[11px] leading-5 text-[var(--muted)]">{body}</p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  variant = "dark",
}: {
  label: string;
  value: string;
  variant?: "blue" | "dark" | "green";
}) {
  const valueColor =
    variant === "blue" ? "text-[#5B6CFF]" : variant === "green" ? "text-emerald-600" : "text-[var(--text)]";

  return (
    <div className="min-w-0 rounded-lg bg-[var(--surface-2)] p-4">
      <strong className={`block text-[22px] font-semibold leading-none tracking-normal ${valueColor}`}>{value}</strong>
      <span className="mt-2 block truncate text-[11px] text-[var(--muted)]">{label}</span>
    </div>
  );
}

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

function PeopleList({
  emptyTitle,
  isLoading,
  users,
}: {
  emptyTitle: string;
  isLoading: boolean;
  users: User[];
}) {
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

function FilesList({ files, isLoading }: { files: WorkspaceFile[]; isLoading: boolean }) {
  if (isLoading) return <ListSkeleton />;

  const items = recentFiles(files);

  if (!items.length) {
    return <EmptyBlock title="Aucun fichier recent" body="Les derniers fichiers apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((file) => (
        <li className="flex min-w-0 items-center gap-2.5" key={file.id}>
          <span className="grid h-8 w-10 shrink-0 place-items-center rounded-md bg-emerald-500/10 text-[9px] font-semibold uppercase text-emerald-500">
            {fileExtension(file)}
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-medium text-[var(--text)]">{file.name}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">Fichier recent</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function NotesList({ isLoading, notes }: { isLoading: boolean; notes: Note[] }) {
  if (isLoading) return <ListSkeleton />;

  const items = recentNotes(notes);

  if (!items.length) {
    return <EmptyBlock title="Aucune note" body="Les notes recentes apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((note) => (
        <li className="flex min-w-0 items-center gap-2.5" key={note.id}>
          <span
            className="h-9 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: note.color ?? "#EF4444" }}
          />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-medium text-[var(--text)]">{note.title}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">Note recente</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function MeetingsList({ isLoading, meetings }: { isLoading: boolean; meetings: DashboardMeeting[] }) {
  if (isLoading) return <ListSkeleton />;

  const items = upcomingMeetings(meetings);

  if (!items.length) {
    return <EmptyBlock title="Aucune reunion a venir" body="Les reunions planifiees apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((meeting) => (
        <li className="flex min-w-0 items-center gap-2.5 rounded-lg bg-[var(--surface-2)] p-2.5" key={meeting.id}>
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              meeting.status === "LIVE" ? "bg-emerald-500" : "bg-[#5B6CFF]"
            }`}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold text-[var(--text)]">{meeting.title}</span>
            <small className="block truncate text-[11px] text-[var(--muted)]">
              {meeting.status === "LIVE" ? "En direct" : formatDateTime(meeting.startsAt)}
              {meeting.roomName ? ` - ${meeting.roomName}` : ""}
            </small>
          </span>
          <a
            className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold ${
              meeting.status === "LIVE"
                ? "bg-[#5B6CFF] text-white"
                : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
            }`}
            href={getMeetingTarget(meeting)}
          >
            {meeting.status === "LIVE" ? "Rejoindre" : "Voir"}
          </a>
        </li>
      ))}
    </ul>
  );
}

function NotificationsList({
  isLoading,
  notifications,
}: {
  isLoading: boolean;
  notifications: DashboardNotification[];
}) {
  if (isLoading) return <ListSkeleton />;

  const items = [...notifications]
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    .slice(0, 5);

  if (!items.length) {
    return <EmptyBlock title="Aucune notification" body="Les alertes importantes apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {items.map((notification) => (
        <li className="flex min-w-0 items-start gap-2.5" key={notification.id}>
          <span
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              notification.readAt ? "bg-slate-300" : "bg-[#5B6CFF]"
            }`}
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-semibold text-[var(--text)]">{notification.title}</span>
            <small className="line-clamp-2 text-[11px] leading-4 text-[var(--muted)]">{notification.message}</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function GlobalStatsWidget({ context }: WidgetComponentProps) {
  if (context.isStatsLoading) return <MetricSkeleton />;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard
        label="Utilisateurs"
        value={String(kpiNumber(context.stats, "users", context.users.length))}
        variant="blue"
      />
      <MetricCard label="Equipes" value={String(kpiNumber(context.stats, "teams", context.teams.length))} />
      <MetricCard
        label="Fichiers"
        value={String(kpiNumber(context.stats, "files", context.files.length))}
        variant="green"
      />
      <MetricCard label="Reunions" value={String(kpiNumber(context.stats, "meetings", context.meetings.length))} />
    </div>
  );
}

function UsersWidget({ context }: WidgetComponentProps) {
  if (context.isUsersLoading) return <ListSkeleton />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard label="Utilisateurs" value={String(context.users.length || kpiNumber(context.stats, "users"))} variant="blue" />
        <MetricCard label="Connectes" value={String(onlineUsers(context.users).length)} variant="green" />
      </div>
      <PeopleList emptyTitle="Aucun utilisateur" isLoading={false} users={context.users.slice(0, 4)} />
    </div>
  );
}

function OnlineUsersWidget({ context }: WidgetComponentProps) {
  return (
    <PeopleList
      emptyTitle="Aucun utilisateur connecte"
      isLoading={context.isUsersLoading}
      users={onlineUsers(context.users)}
    />
  );
}

function TeamsWidget({ context }: WidgetComponentProps) {
  if (context.isTeamsLoading) return <ListSkeleton />;

  const teams = context.teams.slice(0, 5);

  if (!teams.length) {
    return <EmptyBlock title="Aucune equipe" body="Les equipes creees apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {teams.map((team) => (
        <li className="flex min-w-0 items-center gap-2.5" key={team.id}>
          <span className="h-9 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-semibold text-[var(--text)]">{team.name}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">{team.membersCount} membres</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function FilesWidget({ context }: WidgetComponentProps) {
  return <FilesList files={context.files} isLoading={context.isFilesLoading} />;
}

function NotesWidget({ context }: WidgetComponentProps) {
  return <NotesList isLoading={context.isNotesLoading} notes={context.notes} />;
}

function MeetingsWidget({ context }: WidgetComponentProps) {
  return <MeetingsList isLoading={context.isMeetingsLoading} meetings={context.meetings} />;
}

function AuditLogWidget() {
  return (
    <EmptyBlock
      title="Aucun evenement d'audit recent"
      body="Les actions sensibles seront affichees ici quand l'API audit sera disponible."
    />
  );
}

function NotificationsWidget({ context }: WidgetComponentProps) {
  return (
    <NotificationsList
      isLoading={context.isNotificationsLoading}
      notifications={context.notifications}
    />
  );
}

function MyTeamWidget({ context }: WidgetComponentProps) {
  if (context.isTeamsLoading) return <ListSkeleton />;

  if (!context.myTeams.length) {
    return <EmptyBlock title="Aucune equipe" body="Vos equipes apparaitront ici." />;
  }

  return (
    <ul className="space-y-3">
      {context.myTeams.slice(0, 5).map((team) => (
        <li className="flex min-w-0 items-center gap-2.5" key={team.id}>
          <span className="h-9 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
          <span className="min-w-0 flex-1">
            <strong className="block truncate text-[12px] font-semibold text-[var(--text)]">{team.name}</strong>
            <small className="block truncate text-[11px] text-[var(--muted)]">
              {team.description || `${team.membersCount} membres`}
            </small>
          </span>
        </li>
      ))}
    </ul>
  );
}

function OnlineTeamMembersWidget({ context }: WidgetComponentProps) {
  const members = context.teamMembers
    .map((member) => member.user)
    .filter((user): user is User => Boolean(user))
    .filter((user) => user.presence !== "offline");

  return (
    <PeopleList emptyTitle="Aucun membre en ligne" isLoading={context.isTeamMembersLoading} users={members} />
  );
}

function TeamFilesWidget({ context }: WidgetComponentProps) {
  return (
    <FilesList
      files={context.files.filter((file) => Boolean(file.teamId))}
      isLoading={context.isFilesLoading}
    />
  );
}

function TeamNotesWidget({ context }: WidgetComponentProps) {
  return (
    <NotesList
      isLoading={context.isNotesLoading}
      notes={context.notes.filter((note) => Boolean(note.teamId))}
    />
  );
}

function TeamMeetingsWidget({ context }: WidgetComponentProps) {
  return (
    <MeetingsList
      isLoading={context.isMeetingsLoading}
      meetings={context.meetings.filter((meeting) => Boolean(meeting.teamId))}
    />
  );
}

function TeamActivityWidget({ context }: WidgetComponentProps) {
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

function MyMeetingsWidget({ context }: WidgetComponentProps) {
  return <MeetingsList isLoading={context.isMeetingsLoading} meetings={context.meetings} />;
}

function MyFilesWidget({ context }: WidgetComponentProps) {
  return <FilesList files={context.files} isLoading={context.isFilesLoading} />;
}

function MyNotesWidget({ context }: WidgetComponentProps) {
  return <NotesList isLoading={context.isNotesLoading} notes={context.notes} />;
}

function MyNotificationsWidget({ context }: WidgetComponentProps) {
  return <NotificationsList isLoading={context.isNotificationsLoading} notifications={context.notifications} />;
}

function MyCalendarWidget({ context }: WidgetComponentProps) {
  if (context.isCalendarLoading) return <ListSkeleton />;

  const events = upcomingCalendarEvents(context.calendarEvents);

  if (!events.length) {
    return <EmptyBlock title="Aucun evenement a venir" body="Votre calendrier est libre pour le moment." />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      <div className="grid grid-cols-5 border-b border-[var(--border)] bg-[var(--surface)]">
        {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((day) => (
          <span className="px-2 py-1.5 text-center text-[10px] font-medium text-[var(--muted)]" key={day}>
            {day}
          </span>
        ))}
      </div>
      <div className="grid min-h-[150px] grid-cols-5 gap-2 bg-[var(--surface-2)] p-2.5">
        {events.slice(0, 5).map((event, index) => (
          <div
            className="min-w-0 self-start rounded-md bg-[#5B6CFF]/10 p-2.5 text-[#5B6CFF]"
            key={event.id}
            style={{ gridColumnStart: (index % 5) + 1 }}
          >
            <strong className="block truncate text-[12px] font-semibold">{event.title}</strong>
            <small className="mt-1 block truncate text-[10px] text-[#5B6CFF] opacity-80">
              {event.location || formatDateTime(event.startsAt)}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnlineColleaguesWidget({ context }: WidgetComponentProps) {
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

const WIDGET_COMPONENTS: Record<DashboardWidgetType, (props: WidgetComponentProps) => ReactNode> = {
  AUDIT_LOG: AuditLogWidget,
  FILES: FilesWidget,
  GLOBAL_STATS: GlobalStatsWidget,
  MEETINGS: MeetingsWidget,
  MY_CALENDAR: MyCalendarWidget,
  MY_FILES: MyFilesWidget,
  MY_MEETINGS: MyMeetingsWidget,
  MY_NOTES: MyNotesWidget,
  MY_NOTIFICATIONS: MyNotificationsWidget,
  MY_TEAM: MyTeamWidget,
  NOTES: NotesWidget,
  NOTIFICATIONS: NotificationsWidget,
  ONLINE_COLLEAGUES: OnlineColleaguesWidget,
  ONLINE_TEAM_MEMBERS: OnlineTeamMembersWidget,
  ONLINE_USERS: OnlineUsersWidget,
  TEAM_ACTIVITY: TeamActivityWidget,
  TEAM_FILES: TeamFilesWidget,
  TEAM_MEETINGS: TeamMeetingsWidget,
  TEAM_NOTES: TeamNotesWidget,
  TEAMS: TeamsWidget,
  USERS: UsersWidget,
};

function PanelState({ body, title }: { body: string; title: string }) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <div className="space-y-2.5">
        <Icon className="mx-auto text-[var(--muted-soft)]" name="alert" size={20} />
        <h1 className="text-[15px] font-semibold text-[var(--text)]">{title}</h1>
        <p className="max-w-md text-[12px] leading-5 text-[var(--muted)]">{body}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { hasAnyPermission, hasPermission, loading: permissionsLoading } = usePermissions();
  const canViewDashboard = hasPermission(PERMISSIONS.VIEW_DASHBOARD);
  const canReadFiles = hasAnyPermission([
    PERMISSIONS.VIEW_OWN_FILES,
    PERMISSIONS.VIEW_ALL_FILES,
    PERMISSIONS.ACCESS_TEAM_FILES,
  ]);
  const canReadUsers = hasPermission(PERMISSIONS.VIEW_ALL_USERS);
  const canReadTeams = hasAnyPermission([PERMISSIONS.VIEW_TEAMS, PERMISSIONS.VIEW_MY_TEAMS, PERMISSIONS.MANAGE_TEAM]);
  const canReadAllTeams = hasPermission(PERMISSIONS.VIEW_TEAMS);
  const canReadNotes = hasPermission(PERMISSIONS.VIEW_NOTES);
  const canReadMeetings = hasPermission(PERMISSIONS.VIEW_MEETINGS);
  const canReadCalendar = hasPermission(PERMISSIONS.VIEW_CALENDAR);
  const canReadNotifications = hasPermission(PERMISSIONS.VIEW_NOTIFICATIONS);

  const widgetsQuery = useDashboardWidgets(!permissionsLoading && canViewDashboard);
  const widgetsResponse = widgetsQuery.data;
  const role = widgetsResponse?.role;
  const statsQuery = useDashboardStats(role, canViewDashboard);
  const filesQuery = useFiles({ enabled: canViewDashboard && canReadFiles });
  const notesQuery = useNotes({ archived: false }, { enabled: canViewDashboard && canReadNotes });
  const meetingsQuery = useDashboardMeetings(canViewDashboard && canReadMeetings);
  const notificationsQuery = useDashboardNotifications(canViewDashboard && canReadNotifications);
  const calendarQuery = useCalendarEvents({ enabled: canViewDashboard && canReadCalendar });
  const usersQuery = useUsersQuery({ enabled: canViewDashboard && canReadUsers });
  const teamsQuery = useTeams({ enabled: canViewDashboard && canReadAllTeams });
  const myTeamsQuery = useMyTeams({ enabled: canViewDashboard && canReadTeams });
  const firstTeamId = myTeamsQuery.data?.[0]?.id ?? "";
  const teamMembersQuery = useTeamMembers(firstTeamId);

  const permittedWidgets = useMemo(
    () =>
      orderWidgets(widgetsResponse?.widgets ?? []).filter((widget) =>
        widgetHasPermission(widget.type, hasAnyPermission)
      ),
    [hasAnyPermission, widgetsResponse?.widgets]
  );

  const context: DashboardDataContext = {
    calendarEvents: calendarQuery.data ?? [],
    files: filesQuery.data ?? [],
    isCalendarLoading: calendarQuery.isLoading,
    isFilesLoading: filesQuery.isLoading,
    isMeetingsLoading: meetingsQuery.isLoading,
    isNotesLoading: notesQuery.isLoading,
    isNotificationsLoading: notificationsQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    isTeamMembersLoading: teamMembersQuery.isLoading,
    isTeamsLoading: teamsQuery.isLoading || myTeamsQuery.isLoading,
    isUsersLoading: usersQuery.loading,
    meetings: meetingsQuery.data ?? [],
    myTeams: myTeamsQuery.data ?? [],
    notes: notesQuery.data ?? [],
    notifications: notificationsQuery.data ?? [],
    stats: statsQuery.data ?? null,
    teamMembers: teamMembersQuery.data ?? [],
    teams: teamsQuery.data ?? [],
    users: usersQuery.data ?? [],
  };

  if (permissionsLoading || widgetsQuery.isLoading) {
    return <DashboardSkeleton />;
  }

  if (!canViewDashboard) {
    return (
      <PanelState
        title="Dashboard indisponible"
        body="Votre role ne permet pas d'afficher le tableau de bord."
      />
    );
  }

  if (widgetsQuery.error && !widgetsResponse) {
    return (
      <PanelState
        title="Dashboard indisponible"
        body="Impossible de charger les cartes du tableau de bord."
      />
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
            Dashboard {role ? role.toLowerCase() : ""}
          </p>
          <h1 className="mt-1 text-[18px] font-semibold tracking-normal text-[var(--text)]">
            Bonjour {user?.name?.split(" ")[0] ?? "Utilisateur"}.
          </h1>
          <p className="mt-1.5 text-[12px] text-[var(--muted)]">
            {permittedWidgets.length} carte{permittedWidgets.length > 1 ? "s" : ""} disponible
            {permittedWidgets.length > 1 ? "s" : ""} selon vos permissions.
          </p>
        </div>
        {/* <button
          className="inline-flex h-9 w-max cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5B6CFF]"
          type="button"
          onClick={() => widgetsQuery.refetch()}
        >
          <Icon name="refresh" size={12} />
          {/* Actualiser */}
        {/* </button> */} 
      </header>

      {permittedWidgets.length ? (
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-4 lg:grid-cols-2">
          {permittedWidgets.map((widget) => {
            const WidgetComponent = WIDGET_COMPONENTS[widget.type];

            return (
              <WidgetCard key={widget.type} widget={widget}>
                <WidgetComponent context={context} />
              </WidgetCard>
            );
          })}
        </section>
      ) : (
        <PanelState
          title="Aucune carte disponible"
          body="Aucune carte ne correspond a vos permissions actuelles."
        />
      )}
    </div>
  );
}
