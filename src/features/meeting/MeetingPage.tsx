import { useEffect, useMemo, useState,useCallback, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMeetingsQuery } from "../../shared/api/meeting/hooks";
import Toast from "../../components/app/Toast/Toast";

import { meetingService } from "../../shared/api/meeting/service";
import { useUsersQuery } from "../../shared/api/users";
import type { User } from "../../shared/types";
import { motion } from "framer-motion";

type ViewMode = "list" | "month" | "week" | "day";

type MeetingMode = "Online" | "On-site";

type Meeting = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  description: string;
  mode: MeetingMode;
  color: string;
  roomName: string | null;
  joinUrl: string | null;
  organizerId: string | null;
  status: string | null;
  teamId: string | null;
};

type ToastState = {
  show: boolean;
  intent: "success" | "info" | "warning" | "error";
  message: string;
};

type MeetingResponse = {
  id: string;
  title: string;
  description?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  status?: string | null;
  roomName?: string | null;
  joinUrl?: string | null;
  organizerId?: string | null;
  teamId?: string | null;
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
const dropdownWidth = 220;

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

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function getMonday(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function getMonthGrid(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = getMonday(firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function formatTitle(date: Date, view: ViewMode) {
  if (view === "month") {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }

  return date.toLocaleDateString("fr-FR", {
    weekday: view === "day" ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDayName(date: Date, short = false) {
  return date.toLocaleDateString("fr-FR", {
    weekday: short ? "short" : "long",
  });
}

function formatDayNumber(date: Date) {
  return String(date.getDate()).padStart(2, "0");
}

function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function buildLocalDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getUserLabel(user: User) {
  const currentUser = user as User & {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };

  const fullName = [currentUser.firstName, currentUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    currentUser.name || fullName || currentUser.email || "Utilisateur sans nom"
  );
}

function extractRoomNameFromJoinUrl(joinUrl?: string | null) {
  if (!joinUrl) return null;

  try {
    const url = new URL(joinUrl);
    const roomName = url.pathname.replace(/^\/+/, "").trim();
    return roomName || null;
  } catch {
    const parts = joinUrl.split("/").filter(Boolean);
    return parts.at(-1) ?? null;
  }
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      response?: { data?: { message?: unknown } };
    };
    const responseMessage = maybeError.response?.data?.message;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      return maybeError.message;
    }
  }

  return "Une erreur est survenue.";
}

// grisage des reunions passées
function isPastMeeting(meeting: Meeting) {
  const meetingEnd = new Date(`${meeting.date}T${meeting.end}:00`).getTime();
  return meetingEnd < Date.now();
}

function isPastDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime() < Date.now();
}

export default function MeetingPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<ToastState>({
    show: false,
    intent: "success",
    message: "",
  });

  const [form, setForm] = useState({
    title: "",
    date: toDateKey(new Date()),
    start: "09:00",
    end: "10:00",
    description: "",
    mode: "Online" as MeetingMode,
  });

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const meetingsQuery = useMeetingsQuery();
  const [isSaving, setIsSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [addParticipantsOpen, setAddParticipantsOpen] = useState(false);
  const [selectedMeetingForParticipants, setSelectedMeetingForParticipants] =
    useState<Meeting | null>(null);
  const [participantSearch, setParticipantSearch] = useState("");
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);
  const usersQuery = useUsersQuery({ enabled: addParticipantsOpen });
  const usersQueryState = usersQuery as {
    data?: User[] | { data?: User[] };
    loading?: boolean;
    isLoading?: boolean;
    isPending?: boolean;
    error?: unknown;
    refetch?: () => Promise<unknown>;
  };

  const showToast = useCallback(
    (intent: ToastState["intent"], message: string, timeout = 4000) => {
      setToast({ show: true, intent, message });

      window.setTimeout(() => {
        setToast((current) => ({ ...current, show: false }));
      }, timeout);
    },
    [],
  );

  const users = useMemo(() => {
    const rawUsers = usersQueryState.data;

    if (Array.isArray(rawUsers)) {
      return rawUsers;
    }

    if (Array.isArray(rawUsers?.data)) {
      return rawUsers.data;
    }

    return [];
  }, [usersQueryState.data]);

  const usersLoading = Boolean(
    usersQueryState.loading ??
    usersQueryState.isLoading ??
    usersQueryState.isPending ??
    false,
  );
  const usersError = usersQueryState.error;

  const mapMeetingResponse = (
    meeting: MeetingResponse,
    index: number,
  ): Meeting => {
    const startsAt = meeting.startsAt ? new Date(meeting.startsAt) : null;
    const endsAt = meeting.endsAt ? new Date(meeting.endsAt) : null;

    return {
      id: meeting.id,
      title: meeting.title || "Réunion sans titre",
      description: meeting.description ?? "",
      date: startsAt ? getLocalDate(startsAt) : toDateKey(new Date()),
      start: startsAt ? getLocalTime(startsAt) : "09:00",
      end: endsAt ? getLocalTime(endsAt) : "10:00",
      mode: meeting.joinUrl ? "Online" : "On-site",
      color: colors[index % colors.length],
      roomName: meeting.roomName ?? extractRoomNameFromJoinUrl(meeting.joinUrl),
      joinUrl: meeting.joinUrl ?? null,
      organizerId: meeting.organizerId ?? null,
      status: meeting.status ?? null,
      teamId: meeting.teamId ?? null,
    };
  };

  useEffect(() => {
    if (!meetingsQuery.isSuccess) return;

    const response = meetingsQuery.data as
      | MeetingResponse[]
      | { data?: MeetingResponse[] }
      | undefined;
    const loadedMeetings = Array.isArray(response) ? response : response?.data;

    if (Array.isArray(loadedMeetings)) {
      setMeetings(
        loadedMeetings.map((meeting, index) =>
          mapMeetingResponse(meeting, index),
        ),
      );
    }
  }, [meetingsQuery.data, meetingsQuery.isSuccess]);

  const hours = useMemo(
    () =>
      Array.from(
        { length: endHour - startHour + 1 },
        (_, i) => `${String(startHour + i).padStart(2, "0")}:00`,
      ),
    [],
  );

  const weekDays = useMemo(() => {
    const monday = getMonday(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [selectedDate]);

  const monthDays = useMemo(() => getMonthGrid(selectedDate), [selectedDate]);
  const selectedDateKey = toDateKey(selectedDate);

  const visibleDays = view === "day" ? [selectedDate] : weekDays;
  const calendarGridClass =
    view === "day"
      ? "grid-cols-[74px_minmax(260px,1fr)]"
      : "grid-cols-[74px_repeat(7,minmax(132px,1fr))]";

  const getTop = (time: string) => {
    return Math.max(
      0,
      ((timeToMinutes(time) - startHour * 60) / 60) * hourHeight,
    );
  };

  const getHeight = (start: string, end: string) => {
    return Math.max(
      34,
      ((timeToMinutes(end) - timeToMinutes(start)) / 60) * hourHeight,
    );
  };

  const openCreateModal = (date = selectedDateKey, hour = "09:00") => {
    const hourNumber = Number(hour.split(":")[0]);
    const nextHour = `${String(Math.min(hourNumber + 1, 23)).padStart(2, "0")}:00`;

    setOpenMenuId(null);
    setMenuPosition(null);
    setFormError("");
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
    setOpenMenuId(null);
    setMenuPosition(null);
    setFormError("");
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

  const saveMeeting = async () => {
    if (!form.title.trim()) {
      setFormError("Ajoute un titre à la réunion.");
      return;
    }

    if (!form.date || !form.start || !form.end) {
      setFormError("Renseigne la date, l'heure de début et l'heure de fin.");
      return;
    }

    if (timeToMinutes(form.end) <= timeToMinutes(form.start)) {
      setFormError("L'heure de fin doit être après l'heure de début.");
      return;
    }




    if (isPastDateTime(form.date, form.start)) {
  setFormError("Impossible de créer ou modifier une réunion à une date déjà passée.");
  return;
}




    setIsSaving(true);
    setFormError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      startsAt: buildLocalDateTime(form.date, form.start),
      endsAt: buildLocalDateTime(form.date, form.end),
      teamId: null,
    };

    try {
      if (editingMeeting) {
        await meetingService.update(editingMeeting.id, payload);
      } else {
        await meetingService.create(payload);
      }

      await meetingsQuery.refetch?.();
      setOpenModal(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error("Failed to save meeting", error);
      setFormError(
        "Impossible d'enregistrer la réunion. Vérifie le backend puis réessaie.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const cancelMeeting = async (meetingId: string) => {
    setActionLoadingId(meetingId);

    try {
      await meetingService.end(meetingId);
      await meetingsQuery.refetch?.();
      setOpenMenuId(null);
      setMenuPosition(null);
      setOpenModal(false);
      setEditingMeeting(null);
    } catch (error) {
      console.error("Failed to cancel meeting", error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddParticipants = (meeting: Meeting) => {
    setSelectedMeetingForParticipants(meeting);
    setParticipantSearch("");
    setInvitingUserId(null);
    setAddParticipantsOpen(true);
    setOpenMenuId(null);
    setMenuPosition(null);
  };

  const handleInviteParticipant = async (user: User) => {
    if (!selectedMeetingForParticipants || invitingUserId) return;

    setInvitingUserId(user.id);

    try {
      await meetingService.inviteParticipant(
        selectedMeetingForParticipants.id,
        { userId: user.id },
      );
      showToast(
        "success",
        `${getUserLabel(user)} a été invité à la réunion.`,
      );
    } catch (error) {
      console.error("Failed to invite participant", error);
      showToast("error", getErrorMessage(error));
    } finally {
      setInvitingUserId(null);
    }
  };

  const openMeetingRoom = (meeting: Meeting) => {
    setOpenMenuId(null);
    setMenuPosition(null);

    if (meeting.roomName) {
      navigate(`/app/meeting-room/${encodeURIComponent(meeting.roomName)}`);
      return;
    }

    openEditModal(meeting);
  };

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(participantSearch.trim());

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) => {
      const currentUser = user as User & {
        name?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        role?: string | null;
        team?: string | null;
        status?: string | null;
      };

      const searchable = normalizeSearch(
        [
          currentUser.name,
          currentUser.firstName,
          currentUser.lastName,
          currentUser.email,
          currentUser.role,
          currentUser.team,
          currentUser.status,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchable.includes(normalizedQuery);
    });
  }, [participantSearch, users]);

  const goToday = () => setSelectedDate(new Date());

  const goPrevious = () => {
    if (view === "month") setSelectedDate(addMonths(selectedDate, -1));
    else if (view === "day") setSelectedDate(addDays(selectedDate, -1));
    else setSelectedDate(addDays(selectedDate, -7));
  };

  const goNext = () => {
    if (view === "month") setSelectedDate(addMonths(selectedDate, 1));
    else if (view === "day") setSelectedDate(addDays(selectedDate, 1));
    else setSelectedDate(addDays(selectedDate, 7));
  };

  const currentMeetingForMenu =
    meetings.find((meeting) => meeting.id === openMenuId) ?? null;

  const toggleMeetingMenu = (
    event: MouseEvent<HTMLButtonElement>,
    meetingId: string,
  ) => {
    event.stopPropagation();

    if (openMenuId === meetingId) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const gap = 8;
    const safeLeft = Math.max(
      12,
      Math.min(
        rect.right - dropdownWidth,
        window.innerWidth - dropdownWidth - 12,
      ),
    );
    const safeTop = Math.min(rect.bottom + gap, window.innerHeight - 120);

    setOpenMenuId(meetingId);
    setMenuPosition({ top: safeTop, left: safeLeft });
  };

  useEffect(() => {
    if (!openMenuId) return;

    const closeMenu = () => {
      setOpenMenuId(null);
      setMenuPosition(null);
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", closeMenu, true);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, [openMenuId]);

  // const renderMeetingCard = (meeting: Meeting, absolute = true) => (
  //   <div
  //     key={meeting.id}
  //     className={`${absolute ? "absolute left-[8px] right-[8px] z-20" : "relative"} cursor-pointer overflow-hidden rounded-[7px] px-2 py-[6px] pr-8 text-left shadow-sm ${meeting.color}`}
  //     style={
  //       absolute
  //         ? {
  //             top: getTop(meeting.start),
  //             height: getHeight(meeting.start, meeting.end),
  //           }
  //         : undefined
  //     }
  //   >
  //     <button
  //       onClick={() => openMeetingRoom(meeting)}
  //       className="block w-full text-left"
  //       type="button"
  //     >
  //       <div className="truncate text-[12px] font-bold leading-[15px] text-[#171717]">
  //         {meeting.title}
  //       </div>
  //       <div className="truncate text-[11px] font-semibold leading-[14px] text-[#171717]">
  //         {meeting.start} - {meeting.end} · {meeting.mode}
  //         {meeting.joinUrl ? " · Rejoindre" : ""}
  //       </div>
  //       {meeting.description && (
  //         <div className="mt-[2px] truncate text-[11px] font-medium leading-[14px] text-[#171717]">
  //           {meeting.description}
  //         </div>
  //       )}
  //     </button>

  //     <button
  //       onClick={(event) => toggleMeetingMenu(event, meeting.id)}
  //       className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-[16px] leading-none text-[#171717] hover:bg-black/10"
  //       aria-label="Options de la réunion"
  //       type="button"
  //     >
  //       ⋮
  //     </button>
  //   </div>
  // );

const renderMeetingCard = (meeting: Meeting, absolute = true) => {
  const past = isPastMeeting(meeting);

  return (
    <div
      key={meeting.id}
      className={`${absolute ? "absolute left-[8px] right-[8px] z-20" : "relative"} overflow-hidden rounded-[7px] px-2 py-[6px] pr-8 text-left shadow-sm ${
        past
          ? "cursor-not-allowed bg-gray-200 text-gray-500 opacity-70 grayscale dark:bg-[#303036] dark:text-gray-400"
          : `cursor-pointer ${meeting.color}`
      }`}
      style={
        absolute
          ? {
              top: getTop(meeting.start),
              height: getHeight(meeting.start, meeting.end),
            }
          : undefined
      }
    >
      <button
        onClick={() => {
          if (past) return;
          openMeetingRoom(meeting);
        }}
        disabled={past}
        className={`block w-full text-left ${
          past ? "cursor-not-allowed" : ""
        }`}
        type="button"
      >
        <div
          className={`truncate text-[12px] font-bold leading-[15px] ${
            past ? "text-gray-500 dark:text-gray-400" : "text-[#171717]"
          }`}
        >
          {meeting.title}
        </div>

        <div
          className={`truncate text-[11px] font-semibold leading-[14px] ${
            past ? "text-gray-500 dark:text-gray-400" : "text-[#171717]"
          }`}
        >
          {meeting.start} - {meeting.end} · {meeting.mode}
          {meeting.joinUrl && !past ? " · Rejoindre" : ""}
          {past ? " · Terminée" : ""}
        </div>

        {meeting.description && (
          <div
            className={`mt-[2px] truncate text-[11px] font-medium leading-[14px] ${
              past ? "text-gray-500 dark:text-gray-400" : "text-[#171717]"
            }`}
          >
            {meeting.description}
          </div>
        )}
      </button>

      {!past && (
        <button
          onClick={(event) => toggleMeetingMenu(event, meeting.id)}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-[16px] leading-none text-[#171717] hover:bg-black/10"
          aria-label="Options de la réunion"
          type="button"
        >
          ⋮
        </button>
      )}
    </div>
  );
};


  return (
    <div className="flex h-full min-h-0 w-full bg-[#f6f6f6] p-3 text-[13px] text-[#111827] dark:bg-[#0f0f12] dark:text-[#f5f5f5] sm:p-4">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-none flex-col overflow-hidden rounded-[18px] bg-white px-4 py-4 shadow-[0_14px_35px_rgba(0,0,0,0.14)] dark:bg-[#18181b] dark:shadow-[0_14px_35px_rgba(0,0,0,0.35)] sm:px-6 sm:py-5">
        <div className="flex shrink-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={goToday}
              className="rounded-full border border-[#ececec] px-4 py-2 text-[12px] font-semibold shadow-sm hover:bg-[#f7f7f7] dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
              type="button"
            >
              Aujourd'hui
            </button>

            <div className="flex overflow-hidden rounded-full border border-[#ececec] shadow-sm dark:border-[#2a2a2e]">
              <button
                onClick={goPrevious}
                className="px-4 py-2 text-[14px] leading-none hover:bg-[#f7f7f7] dark:hover:bg-[#222226]"
                type="button"
              >
                ‹
              </button>
              <div className="h-8 w-px bg-[#ececec] dark:bg-[#2a2a2e]" />
              <button
                onClick={goNext}
                className="px-4 py-2 text-[14px] leading-none hover:bg-[#f7f7f7] dark:hover:bg-[#222226]"
                type="button"
              >
                ›
              </button>
            </div>

            <h1 className="text-[16px] font-semibold capitalize tracking-tight sm:text-[17px]">
              {formatTitle(selectedDate, view)}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-full border border-[#ececec] p-1 shadow-sm dark:border-[#2a2a2e]">
              {(["list", "month", "week", "day"] as ViewMode[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setView(item)}
                  className={`rounded-full px-3 py-2 text-[11px] font-semibold sm:px-4 ${
                    view === item
                      ? "bg-[#e9e9e9] shadow-sm dark:bg-[#2b2b31]"
                      : "hover:bg-[#f7f7f7] dark:hover:bg-[#222226]"
                  }`}
                  type="button"
                >
                  {item === "list"
                    ? "Liste"
                    : item === "month"
                      ? "Mois"
                      : item === "week"
                        ? "Semaine"
                        : "Jour"}
                </button>
              ))}
            </div>
            <button
            onClick={() => {
              if (isPastDateTime(selectedDateKey, "09:00")) {
                showToast("warning", "Sélectionne une date future pour créer une réunion.");
                return;}
                openCreateModal();}}
                className="rounded-full bg-black px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#222] dark:bg-white dark:text-black dark:hover:bg-[#e8e8e8]"
                type="button">
              Créer une réunion
            </button>
          </div>
        </div>

        {meetingsQuery.isLoading && (
          <div className="mt-4 shrink-0 rounded-[12px] border border-[#eeeeee] px-4 py-3 text-[12px] font-medium text-[#6b7280] dark:border-[#2a2a2e] dark:text-[#c9c9cf]">
            Chargement des réunions...
          </div>
        )}

        {view === "month" ? (
          <div className="mt-5 grid min-h-0 flex-1 grid-rows-[36px_minmax(0,1fr)] overflow-hidden border-t border-l border-[#e5e7eb] dark:border-[#2a2a2e]">
            <div className="grid grid-cols-7 border-b border-[#e5e7eb] dark:border-[#2a2a2e]">
              {weekDays.map((day) => (
                <div
                  key={toDateKey(day)}
                  className="flex items-center justify-center border-r border-[#e5e7eb] text-[12px] font-semibold capitalize last:border-r-0 dark:border-[#2a2a2e]"
                >
                  {formatDayName(day, true)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 grid-rows-6 overflow-y-auto">
              {monthDays.map((day) => {
                const dateKey = toDateKey(day);
                const dayMeetings = meetings.filter(
                  (meeting) => meeting.date === dateKey,
                );
                const isCurrentMonth =
                  day.getMonth() === selectedDate.getMonth();
                const isSelected = dateKey === selectedDateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => {
                      setSelectedDate(day);
                      setView("day");
                    }}
                    className="min-h-[104px] border-r border-b border-[#e5e7eb] p-2 text-left hover:bg-[#fafafa] dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
                    type="button"
                  >
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-bold ${
                        isSelected
                          ? "bg-[#168cf0] text-white"
                          : isCurrentMonth
                            ? "text-[#111827] dark:text-[#f5f5f5]"
                            : "text-[#9ca3af]"
                      }`}
                    >
                      {formatDayNumber(day)}
                    </span>

                    <div className="mt-2 space-y-1">
                      {dayMeetings.slice(0, 3).map((meeting) => (
                        <div
                          key={meeting.id}
                          className={`truncate rounded px-2 py-1 text-[11px] font-semibold ${
                            isPastMeeting(meeting)
                            ? "bg-gray-200 text-gray-500 opacity-70 grayscale dark:bg-[#303036] dark:text-gray-400"
                            : `text-[#171717] ${meeting.color}`
                              }`}>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              openMeetingRoom(meeting);
                            }}
                            className="block w-full truncate text-left"
                            type="button"
                          >
                            {meeting.start} · {meeting.title}
                          </button>
                        </div>
                      ))}
                      {dayMeetings.length > 3 && (
                        <p className="text-[11px] font-semibold text-[#6b7280]">
                          +{dayMeetings.length - 3}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : view === "list" ? (
          <div className="mt-5 min-h-0 flex-1 overflow-y-auto border-t border-[#e5e7eb] pt-4 dark:border-[#2a2a2e]">
            <div className="space-y-2">
              {meetings.length === 0 ? (
                <div className="rounded-[12px] border border-dashed border-[#d1d5db] p-8 text-center text-[13px] font-medium text-[#6b7280] dark:border-[#2a2a2e] dark:text-[#c9c9cf]">
                  Aucune réunion pour le moment.
                </div>
              ) : (
                [...meetings]
                  .sort((a, b) =>
                    `${a.date} ${a.start}`.localeCompare(
                      `${b.date} ${b.start}`,
                    ),
                  )
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                     className={`relative rounded-[12px] border px-4 py-3 pr-12 ${
                      isPastMeeting(meeting)
                      ? "border-gray-200 bg-gray-100 text-gray-500 opacity-75 grayscale dark:border-[#303036] dark:bg-[#242428] dark:text-gray-400"
                      : "border-[#eeeeee] dark:border-[#2a2a2e]"
                      }`}>
                      <button
                        onClick={() => openMeetingRoom(meeting)}
                        className="block w-full text-left hover:opacity-80"
                        type="button"
                      >
                        <p className="text-[13px] font-bold">{meeting.title}</p>
                        <p
                        className={`text-[12px] font-medium ${
                          isPastMeeting(meeting)
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-gray-600 dark:text-gray-300"
}`}
>
                          {meeting.date} · {meeting.start} - {meeting.end} ·{" "}
                          {meeting.mode}
                          {meeting.joinUrl ? " · Cliquer pour rejoindre" : ""}
                        </p>
                      </button>
                      <button
                        onClick={(event) =>
                          toggleMeetingMenu(event, meeting.id)
                        }
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[16px] leading-none text-[#171717] hover:bg-black/10 dark:text-[#f5f5f5] dark:hover:bg-white/10"
                        aria-label="Options de la réunion"
                        type="button"
                      >
                        ⋮
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[#cfcfcf] dark:border-[#2a2a2e]">
            <div
              className={`grid ${calendarGridClass} border-b border-[#cfcfcf] dark:border-[#2a2a2e]`}
            >
              <div className="h-11" />
              {visibleDays.map((day) => {
                const dateKey = toDateKey(day);
                const active = dateKey === selectedDateKey;

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(day)}
                    className="flex h-11 items-center justify-center gap-2 border-r border-[#eeeeee] text-[12px] font-semibold capitalize last:border-r-0 hover:bg-[#fafafa] dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
                    type="button"
                  >
                    <span>{formatDayName(day)}</span>
                    <span
                      className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[11px] font-bold ${
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

            <div
              className={`relative grid min-h-0 flex-1 ${calendarGridClass} overflow-auto`}
            >
              <div className="border-r border-[#eeeeee] dark:border-[#2a2a2e]">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[72px] pr-3 pt-2 text-right text-[12px] font-medium text-[#4b5563] dark:text-[#c9c9cf]"
                  >
                    {hour}
                  </div>
                ))}
              </div>

              {visibleDays.map((day) => {
                const dateKey = toDateKey(day);
                const dayMeetings = meetings.filter(
                  (meeting) => meeting.date === dateKey,
                );

                return (
                  <div
                    key={dateKey}
                    className="relative min-w-[132px] border-r border-[#eeeeee] last:border-r-0 dark:border-[#2a2a2e]"
                  >
                    {hours.map((hour) => (
                      // <button
                      //   key={hour}
                      //   onClick={() => openCreateModal(dateKey, hour)}
                      //   className="block h-[72px] w-full cursor-pointer border-b border-[#eeeeee] text-left hover:bg-[#fafafa] dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
                      //   type="button"
                      // />
                      <button key={hour}onClick={() => {
                        if (isPastDateTime(dateKey, hour)) {
                          showToast("warning", "Impossible de créer une réunion à une date déjà passée.");
                          return;
                        }
                        openCreateModal(dateKey, hour);
                      }}
                      className={`block h-[72px] w-full border-b border-[#eeeeee] text-left dark:border-[#2a2a2e] ${
                        isPastDateTime(dateKey, hour)
                        ? "cursor-not-allowed bg-gray-50 dark:bg-[#151519]"
                        : "cursor-pointer hover:bg-[#fafafa] dark:hover:bg-[#222226]"
                        }`}
                        type="button"/>
                    ))}

                    {dayMeetings.map((meeting) => renderMeetingCard(meeting))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {openMenuId && menuPosition && currentMeetingForMenu && (
        <motion.div
          className="fixed z-[9999] w-[220px] overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white py-1 text-[12px] shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:border-[#2a2a2e] dark:bg-[#222226]"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={(event) => event.stopPropagation()}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: -8,
          }}
          transition={{
            duration: 0.15,
            ease: "easeOut",
          }}
        >
          {currentMeetingForMenu.joinUrl && (
            <button
              onClick={() => openMeetingRoom(currentMeetingForMenu)}
              className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-[#111827] hover:bg-[#f3f4f6] dark:text-[#f5f5f5] dark:hover:bg-[#2f2f35]"
              type="button"
            >
              Rejoindre la réunion
            </button>
          )}

          <button
            onClick={() => handleAddParticipants(currentMeetingForMenu)}
            className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-[#111827] hover:bg-[#f3f4f6] dark:text-[#f5f5f5] dark:hover:bg-[#2f2f35]"
            type="button"
          >
            Ajouter un participant
          </button>

          <button
            onClick={() => openEditModal(currentMeetingForMenu)}
            className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-[#111827] hover:bg-[#f3f4f6] dark:text-[#f5f5f5] dark:hover:bg-[#2f2f35]"
            type="button"
          >
            Modifier
          </button>

          <button
            onClick={() => cancelMeeting(currentMeetingForMenu.id)}
            disabled={actionLoadingId === currentMeetingForMenu.id}
            className="flex w-full items-center px-4 py-2.5 text-left font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-950/30"
            type="button"
          >
            {actionLoadingId === currentMeetingForMenu.id
              ? "Annulation..."
              : "Annuler la réunion"}
          </button>
        </motion.div>
      )}

      {openModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onMouseDown={() => setOpenModal(false)}
        >
          <div
            className="w-full max-w-[460px] rounded-[18px] bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] dark:bg-[#18181b] sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 className="text-[16px] font-semibold">
              {editingMeeting ? "Modifier la réunion" : "Créer une réunion"}
            </h2>

            <div className="mt-5 space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titre"
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#168cf0] dark:border-[#2a2a2e] dark:bg-[#111114]"
              />

            <input type="date" min={toDateKey(new Date())}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#168cf0] dark:border-[#2a2a2e] dark:bg-[#111114]"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={form.start}
                  onChange={(e) => setForm({ ...form, start: e.target.value })}
                  className="rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#168cf0] dark:border-[#2a2a2e] dark:bg-[#111114]"
                />

                <input
                  type="time"
                  value={form.end}
                  onChange={(e) => setForm({ ...form, end: e.target.value })}
                  className="rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#168cf0] dark:border-[#2a2a2e] dark:bg-[#111114]"
                />
              </div>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Description"
                className="h-[95px] w-full resize-none rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#168cf0] dark:border-[#2a2a2e] dark:bg-[#111114]"
              />

              <select
                value={form.mode}
                onChange={(e) =>
                  setForm({ ...form, mode: e.target.value as MeetingMode })
                }
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#168cf0] dark:border-[#2a2a2e] dark:bg-[#111114]"
              >
                <option value="Online">Online</option>
                <option value="On-site">On-site</option>
              </select>

              {formError && (
                <p className="rounded-[10px] bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600 dark:bg-red-950/30">
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              {editingMeeting ? (
                <button
                  onClick={() => cancelMeeting(editingMeeting.id)}
                  disabled={actionLoadingId === editingMeeting.id}
                  className="rounded-full border border-red-200 px-5 py-2 text-[13px] font-semibold text-red-600 disabled:opacity-60 dark:border-red-900"
                  type="button"
                >
                  {actionLoadingId === editingMeeting.id
                    ? "Annulation..."
                    : "Annuler"}
                </button>
              ) : (
                <div />
              )}

              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => setOpenModal(false)}
                  className="rounded-full border border-[#e5e5e5] px-5 py-2 text-[13px] font-semibold dark:border-[#2a2a2e]"
                  type="button"
                >
                  Fermer
                </button>

                <button
                  onClick={saveMeeting}
                  disabled={isSaving}
                  className="rounded-full bg-black px-5 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
                  type="button"
                >
                  {isSaving
                    ? "Enregistrement..."
                    : editingMeeting
                      ? "Modifier"
                      : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {addParticipantsOpen && selectedMeetingForParticipants && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onMouseDown={() => setAddParticipantsOpen(false)}
        >
          <div
            className="w-full max-w-[460px] rounded-[18px] bg-white p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] dark:bg-[#18181b] sm:p-6"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 className="text-[16px] font-semibold">Participants</h2>
            <p className="mt-1 text-[12px] font-medium text-[#6b7280] dark:text-[#c9c9cf]">
              {selectedMeetingForParticipants.title}
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={participantSearch}
                onChange={(event) => setParticipantSearch(event.target.value)}
                placeholder="Chercher un utilisateur..."
                className="w-full rounded-[10px] border border-[#e5e5e5] bg-white px-4 py-3 text-[13px] outline-none focus:border-[#168cf0] dark:border-[#2a2a2e] dark:bg-[#111114]"
              />

              <div className="max-h-[300px] overflow-y-auto rounded-[12px] border border-[#e5e7eb] dark:border-[#2a2a2e]">
                {usersLoading ? (
                  <div className="p-4 text-center text-[12px] font-medium text-[#6b7280] dark:text-[#c9c9cf]">
                    Chargement des utilisateurs...
                  </div>
                ) : usersError ? (
                  <div className="space-y-3 p-4 text-center">
                    <p className="text-[12px] font-medium text-red-600">
                      Impossible de charger les utilisateurs.
                    </p>
                    <button
                      onClick={() => void usersQueryState.refetch?.()}
                      className="rounded-full border border-[#e5e5e5] px-4 py-2 text-[12px] font-semibold dark:border-[#2a2a2e]"
                      type="button"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : visibleUsers.length === 0 ? (
                  <div className="p-4 text-center text-[12px] font-medium text-[#6b7280] dark:text-[#c9c9cf]">
                    Aucun utilisateur trouvé.
                  </div>
                ) : (
                  visibleUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => void handleInviteParticipant(user)}
                      disabled={Boolean(invitingUserId)}
                      className="flex w-full items-center justify-between gap-3 border-b border-[#eeeeee] px-4 py-3 text-left last:border-b-0 hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#2a2a2e] dark:hover:bg-[#222226]"
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold">
                          {getUserLabel(user)}
                        </span>
                        {user.email && (
                          <span className="block truncate text-[12px] font-medium text-[#6b7280] dark:text-[#c9c9cf]">
                            {user.email}
                          </span>
                        )}
                      </span>
                      {invitingUserId === user.id ? (
                        <span className="shrink-0 text-[11px] font-semibold text-[#6b7280] dark:text-[#c9c9cf]">
                          Invitation...
                        </span>
                      ) : (
                        Boolean(
                          (user as User & { role?: string | null }).role,
                        ) && (
                          <span className="shrink-0 rounded-full bg-[#f3f4f6] px-2 py-1 text-[10px] font-bold dark:bg-[#2b2b31]">
                            {(user as User & { role?: string | null }).role}
                          </span>
                        )
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setAddParticipantsOpen(false);
                  setSelectedMeetingForParticipants(null);
                  setParticipantSearch("");
                  setInvitingUserId(null);
                }}
                className="rounded-full border border-[#e5e5e5] px-5 py-2 text-[13px] font-semibold dark:border-[#2a2a2e]"
                type="button"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <Toast intent={toast.intent} message={toast.message} />
      )}
    </div>
  );
}
