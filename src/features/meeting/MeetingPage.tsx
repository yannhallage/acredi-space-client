import { useMemo, useState } from "react";

type ViewMode = "list" | "month" | "week" | "day";

type Meeting = {
  id: number;
  title: string;
  date: string;
  start: string;
  end: string;
  description: string;
  mode: "Online" | "On-site";
  color: string;
};

const colors = [
  "bg-[#9bdcf7]",
  "bg-[#b7addd]",
  "bg-[#55d6d1]",
  "bg-[#ffe477]",
  "bg-[#ffb09e]",
];

const hourHeight = 72;
const startHour = 7;
const endHour = 22;

function toDateKey(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function formatTitle(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDayName(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function formatDayNumber(date: Date) {
  return String(date.getDate()).padStart(2, "0");
}

export default function MeetingPage() {
  const [view, setView] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date("2025-01-09"));
  const [openModal, setOpenModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [form, setForm] = useState({
    title: "",
    date: toDateKey(selectedDate),
    start: "09:00",
    end: "10:00",
    description: "",
    mode: "Online" as "Online" | "On-site",
  });

  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: "Réunion équipe",
      date: "2025-01-09",
      start: "09:00",
      end: "10:30",
      description: "Brief quotidien",
      mode: "Online",
      color: "bg-[#9bdcf7]",
    },
    {
      id: 2,
      title: "Point client",
      date: "2025-01-09",
      start: "14:00",
      end: "15:00",
      description: "Validation du projet",
      mode: "On-site",
      color: "bg-[#b7addd]",
    },
    {
      id: 3,
      title: "Sprint planning",
      date: "2025-01-10",
      start: "11:00",
      end: "12:30",
      description: "Organisation du sprint",
      mode: "Online",
      color: "bg-[#55d6d1]",
    },
    {
      id: 4,
      title: "Démo produit",
      date: "2025-01-11",
      start: "16:00",
      end: "17:00",
      description: "Présentation interne",
      mode: "On-site",
      color: "bg-[#ffe477]",
    },
  ]);

  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => `${String(startHour + i).padStart(2, "0")}:00`
  );

  const weekDays = useMemo(() => {
    const monday = getMonday(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [selectedDate]);

  const selectedDateKey = toDateKey(selectedDate);

  const getTop = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return (h - startHour) * hourHeight + (m / 60) * hourHeight;
  };

  const getHeight = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    return Math.max(
      34,
      (((eh * 60 + em) - (sh * 60 + sm)) / 60) * hourHeight
    );
  };

  const openCreateModal = (date = selectedDateKey, hour = "09:00") => {
    const nextHour = `${String(Number(hour.split(":")[0]) + 1).padStart(
      2,
      "0"
    )}:00`;

    setEditingMeeting(null);
    setForm({
      title: "",
      date,
      start: hour,
      end: nextHour,
      description: "",
      mode: "Online",
    });
    setOpenModal(true);
  };

  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setForm({
      title: meeting.title,
      date: meeting.date,
      start: meeting.start,
      end: meeting.end,
      description: meeting.description,
      mode: meeting.mode,
    });
    setOpenModal(true);
  };

  const saveMeeting = () => {
    if (!form.title.trim() || !form.date || !form.start || !form.end) return;

    if (editingMeeting) {
      setMeetings((current) =>
        current.map((meeting) =>
          meeting.id === editingMeeting.id ? { ...meeting, ...form } : meeting
        )
      );
    } else {
      setMeetings((current) => [
        ...current,
        {
          id: Date.now(),
          ...form,
          color: colors[current.length % colors.length],
        },
      ]);
    }

    setOpenModal(false);
  };

  const deleteMeeting = () => {
    if (!editingMeeting) return;

    setMeetings((current) =>
      current.filter((meeting) => meeting.id !== editingMeeting.id)
    );

    setOpenModal(false);
  };

  const goToday = () => setSelectedDate(new Date());

  const goPrevious = () => {
    setSelectedDate(addDays(selectedDate, -7));
  };

  const goNext = () => {
    setSelectedDate(addDays(selectedDate, 7));
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] p-4 text-[14px] text-[#111827] dark:bg-[#0f0f12] dark:text-[#f5f5f5]">
      <div className="mx-auto h-[calc(100vh-32px)] w-full max-w-none rounded-[18px] bg-white px-6 py-6 shadow-[0_14px_35px_rgba(0,0,0,0.14)] dark:bg-[#18181b] dark:shadow-[0_14px_35px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goToday}
              className="rounded-full border border-[#ececec] px-5 py-2 text-[14px] font-medium shadow-sm hover:bg-[#f7f7f7] dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
            >
              Today
            </button>

            <div className="flex overflow-hidden rounded-full border border-[#ececec] shadow-sm dark:border-[#2a2a2e]">
              <button
                onClick={goPrevious}
                className="px-4 py-2 text-[14px] leading-none hover:bg-[#f7f7f7] dark:hover:bg-[#222226]"
              >
                ‹
              </button>
              <div className="h-8 w-px bg-[#ececec] dark:bg-[#2a2a2e]" />
              <button
                onClick={goNext}
                className="px-4 py-2 text-[14px] leading-none hover:bg-[#f7f7f7] dark:hover:bg-[#222226]"
              >
                ›
              </button>
            </div>

            <h1 className="text-[18px] font-semibold tracking-tight">
              {formatTitle(selectedDate)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-[#ececec] p-1 shadow-sm dark:border-[#2a2a2e]">
              {(["list", "month", "week", "day"] as ViewMode[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setView(item)}
                  className={`rounded-full px-5 py-2 text-[14px] font-medium ${
                    view === item
                      ? "bg-[#e9e9e9] shadow-sm dark:bg-[#2b2b31]"
                      : "hover:bg-[#f7f7f7] dark:hover:bg-[#222226]"
                  }`}
                >
                  {item === "list"
                    ? "List view"
                    : item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => openCreateModal()}
              className="rounded-full bg-black cursor-pointer px-5 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#222] dark:bg-white dark:text-black dark:hover:bg-[#e8e8e8]"
            >
              Créer une réunion
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-[#cfcfcf] dark:border-[#2a2a2e]">
          <div className="grid grid-cols-[74px_repeat(7,minmax(150px,1fr))] border-b border-[#cfcfcf] dark:border-[#2a2a2e]">
            <div className="h-11" />

            {weekDays.map((day) => {
              const dateKey = toDateKey(day);
              const active = dateKey === selectedDateKey;

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className="flex h-11 items-center cursor-pointer justify-center gap-2 border-r border-[#eeeeee] text-[14px] font-medium last:border-r-0 hover:bg-[#fafafa] dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
                >
                  <span>{formatDayName(day)}</span>
                  <span
                    className={`flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-bold ${
                      active
                        ? "bg-[#168cf0] text-white"
                        : "text-[#111827] dark:text-[#f5f5f5]"
                    }`}
                  >
                    {formatDayNumber(day)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative grid h-[calc(100vh-210px)] grid-cols-[74px_repeat(7,minmax(150px,1fr))] overflow-y-auto">
            <div className="border-r border-[#eeeeee] dark:border-[#2a2a2e]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[72px] pr-3 pt-2 text-right text-[13px] font-medium text-[#4b5563] dark:text-[#c9c9cf]"
                >
                  {hour}
                </div>
              ))}
            </div>

            {weekDays.map((day) => {
              const dateKey = toDateKey(day);
              const dayMeetings = meetings.filter(
                (meeting) => meeting.date === dateKey
              );

              return (
                <div
                  key={dateKey}
                  className="relative border-r border-[#eeeeee] last:border-r-0 dark:border-[#2a2a2e]"
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      onClick={() => openCreateModal(dateKey, hour)}
                      className="h-[72px] cursor-pointer border-b border-[#eeeeee] hover:bg-[#fafafa] dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
                    />
                  ))}

                  {dayMeetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditModal(meeting);
                      }}
                      className={`absolute left-[8px] cursor-pointer right-[8px] rounded-[5px] px-2 py-[6px] text-left shadow-sm ${meeting.color}`}
                      style={{
                        top: getTop(meeting.start),
                        height: getHeight(meeting.start, meeting.end),
                      }}
                    >
                      <div className="truncate text-[13px] font-bold leading-[15px] text-[#171717]">
                        {meeting.title}
                      </div>
                      <div className="truncate text-[12px] font-semibold leading-[14px] text-[#171717]">
                        {meeting.start} - {meeting.end} · {meeting.mode}
                      </div>
                      <div className="mt-[2px] truncate text-[12px] font-medium leading-[14px] text-[#171717]">
                        {meeting.description}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {view === "list" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35">
          <div className="w-full max-w-[560px] rounded-[18px] bg-white p-6 shadow-2xl dark:bg-[#18181b]">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold">Liste des réunions</h2>
              <button
                onClick={() => setView("week")}
                className="text-[14px] font-medium cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {meetings.map((meeting) => (
                <button
                  key={meeting.id}
                  onClick={() => openEditModal(meeting)}
                  className="w-full rounded-[10px] border cursor-pointer border-[#eeeeee] px-4 py-3 text-left hover:bg-gray-50 dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
                >
                  <p className="text-[14px] font-bold">{meeting.title}</p>
                  <p className="text-[13px] font-medium text-gray-600 dark:text-gray-300">
                    {meeting.date} · {meeting.start} - {meeting.end} ·{" "}
                    {meeting.mode}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35">
          <div className="w-full max-w-[460px] rounded-[18px] bg-white p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)] dark:bg-[#18181b]">
            <h2 className="text-[16px] font-semibold">
              {editingMeeting ? "Modifier la réunion" : "Créer une réunion"}
            </h2>

            <div className="mt-5 space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] outline-none dark:border-[#2a2a2e] dark:bg-[#111114]"
              />

              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] outline-none dark:border-[#2a2a2e] dark:bg-[#111114]"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={form.start}
                  onChange={(e) =>
                    setForm({ ...form, start: e.target.value })
                  }
                  className="rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] outline-none dark:border-[#2a2a2e] dark:bg-[#111114]"
                />

                <input
                  type="time"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  className="rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] outline-none dark:border-[#2a2a2e] dark:bg-[#111114]"
                />
              </div>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                className="h-[95px] w-full resize-none rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] outline-none dark:border-[#2a2a2e] dark:bg-[#111114]"
              />

              <select
                value={form.mode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mode: e.target.value as "Online" | "On-site",
                  })
                }
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[14px] outline-none dark:border-[#2a2a2e] dark:bg-[#111114]"
              >
                <option value="Online">Online</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div className="mt-6 flex justify-between">
              {editingMeeting ? (
                <button
                  onClick={deleteMeeting}
                  className="rounded-full border cursor-pointer border-red-200 px-5 py-2 text-[14px] font-semibold text-red-600 dark:border-red-900"
                >
                  Supprimer
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setOpenModal(false)}
                  className="rounded-full border cursor-pointer border-[#e5e5e5] px-5 py-2 text-[14px] font-semibold dark:border-[#2a2a2e]"
                >
                  Annuler
                </button>

                <button
                  onClick={saveMeeting}
                  className="rounded-full bg-black cursor-pointer px-5 py-2 text-[14px] font-semibold text-white dark:bg-white dark:text-black"
                >
                  {editingMeeting ? "Modifier" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}