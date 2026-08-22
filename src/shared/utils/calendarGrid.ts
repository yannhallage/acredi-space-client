export type CalendarViewMode = "list" | "month" | "week" | "day";

export const CALENDAR_HOUR_HEIGHT = 72;
export const CALENDAR_START_HOUR = 6;
export const CALENDAR_END_HOUR = 24;

export function toDateKey(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

export function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function getMonthGrid(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = getMonday(firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function formatCalendarTitle(
  date: Date,
  view: CalendarViewMode,
  listLabel = "Tous les evenements"
) {
  if (view === "month") {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  if (view === "list") {
    return listLabel;
  }

  return date.toLocaleDateString("fr-FR", {
    weekday: view === "day" ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDayName(date: Date, short = false) {
  return date.toLocaleDateString("fr-FR", {
    weekday: short ? "short" : "long",
  });
}

export function formatDayNumber(date: Date) {
  return String(date.getDate()).padStart(2, "0");
}

export function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function buildLocalDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

export function buildDateTimeLocal(dateKey: string, time: string) {
  return `${dateKey}T${time}`;
}

export function formatCalendarHour(hour: number) {
  return `${String(((hour % 24) + 24) % 24).padStart(2, "0")}:00`;
}

export function getCalendarHours(
  startHour = CALENDAR_START_HOUR,
  endHour = CALENDAR_END_HOUR
) {
  const lastHour = endHour === 0 ? 24 : endHour;

  return Array.from({ length: lastHour - startHour + 1 }, (_, index) =>
    formatCalendarHour(startHour + index)
  );
}

export function getNextHourSlot(dateKey: string, hour: string) {
  const hourNumber = Number(hour.split(":")[0]);
  const anchorDate = new Date(`${dateKey}T12:00:00`);

  if (hourNumber >= 23) {
    return {
      dateKey: toDateKey(addDays(anchorDate, 1)),
      time: "00:00",
    };
  }

  return {
    dateKey,
    time: `${String(hourNumber + 1).padStart(2, "0")}:00`,
  };
}

export function resolveEndDateTime(
  dateKey: string,
  startTime: string,
  endTime: string
) {
  const startMs = new Date(buildLocalDateTime(dateKey, startTime)).getTime();
  let endDateKey = dateKey;

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    endDateKey = toDateKey(addDays(new Date(`${dateKey}T12:00:00`), 1));
  }

  const endMs = new Date(buildLocalDateTime(endDateKey, endTime)).getTime();

  return {
    endsAt: buildLocalDateTime(endDateKey, endTime),
    isValid: endMs > startMs,
  };
}

export function getCalendarTop(
  time: string,
  startHour = CALENDAR_START_HOUR,
  hourHeight = CALENDAR_HOUR_HEIGHT
) {
  return Math.max(
    0,
    ((timeToMinutes(time) - startHour * 60) / 60) * hourHeight
  );
}

export function getCalendarHeight(
  start: string,
  end: string,
  hourHeight = CALENDAR_HOUR_HEIGHT
) {
  let endMinutes = timeToMinutes(end);
  const startMinutes = timeToMinutes(start);

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return Math.max(
    34,
    ((endMinutes - startMinutes) / 60) * hourHeight
  );
}

export function getWeekDays(selectedDate: Date) {
  const monday = getMonday(selectedDate);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}
