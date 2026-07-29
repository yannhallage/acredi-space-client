import type { MouseEvent } from "react";
import type { Meeting } from "../../types";
import { MeetingWeekView } from "./MeetingWeekView";

type MeetingDayViewProps = {
  selectedDate: Date;
  selectedDateKey: string;
  meetings: Meeting[];
  isLoading: boolean;
  onSelectDay: (day: Date) => void;
  onCreateAtSlot: (dateKey: string, hour: string) => void;
  onPastDateWarning: (message: string) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onToggleMenu: (event: MouseEvent<HTMLButtonElement>, meetingId: string) => void;
};

export function MeetingDayView({
  selectedDate,
  selectedDateKey,
  meetings,
  isLoading,
  onSelectDay,
  onCreateAtSlot,
  onPastDateWarning,
  onOpenMeeting,
  onToggleMenu,
}: MeetingDayViewProps) {
  return (
    <MeetingWeekView
      view="day"
      visibleDays={[selectedDate]}
      selectedDateKey={selectedDateKey}
      calendarGridClass="grid-cols-[74px_minmax(260px,1fr)]"
      meetings={meetings}
      isLoading={isLoading}
      onSelectDay={onSelectDay}
      onCreateAtSlot={onCreateAtSlot}
      onPastDateWarning={onPastDateWarning}
      onOpenMeeting={onOpenMeeting}
      onToggleMenu={onToggleMenu}
    />
  );
}
