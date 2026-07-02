import type { WidgetComponentProps } from "../../constants";
import { MeetingsList } from "./MeetingsList";

export function MeetingsWidget({ context }: WidgetComponentProps) {
  return <MeetingsList isLoading={context.isMeetingsLoading} meetings={context.meetings} />;
}

export function MyMeetingsWidget({ context }: WidgetComponentProps) {
  return <MeetingsList isLoading={context.isMeetingsLoading} meetings={context.meetings} />;
}

export function TeamMeetingsWidget({ context }: WidgetComponentProps) {
  return (
    <MeetingsList
      isLoading={context.isMeetingsLoading}
      meetings={context.meetings.filter((meeting) => Boolean(meeting.teamId))}
    />
  );
}
