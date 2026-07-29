import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { useMeetingsQuery } from "../../../shared/api/meeting/hooks";
import { meetingService } from "../../../shared/api/meeting/service";
import {
  buildMeetingRoomUrl,
  extractMeetingRoomName,
} from "../../../shared/api/meeting/room";
import { useUsersQuery } from "../../../shared/api/users";
import type { User } from "../../../shared/types";
import {
  addDays,
  addMonths,
  buildLocalDateTime,
  getNextHourSlot,
  getWeekDays,
  resolveEndDateTime,
  toDateKey,
} from "../../../shared/utils/calendarGrid";
import type {
  Meeting,
  MeetingAction,
  MeetingFormState,
  MeetingResponse,
  ToastState,
  ViewMode,
} from "../types";
import {
  DROPDOWN_WIDTH,
  getErrorMessage,
  getMeetingActionKey,
  getUserLabel,
  isPastDateTime,
  mapMeetingResponse,
  normalizeSearch,
} from "../utils";

export function useMeetingPage() {
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
  const [form, setForm] = useState<MeetingFormState>({
    title: "",
    date: toDateKey(new Date()),
    start: "09:00",
    end: "10:00",
    description: "",
    mode: "Online",
  });
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const meetingsQuery = useMeetingsQuery();
  const isMeetingsLoading =
    meetingsQuery.isPending ||
    meetingsQuery.isLoading ||
    (!meetingsQuery.isSuccess && meetingsQuery.isFetching);
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
    if (Array.isArray(rawUsers)) return rawUsers;
    if (Array.isArray(rawUsers?.data)) return rawUsers.data;
    return [];
  }, [usersQueryState.data]);

  const usersLoading = Boolean(
    usersQueryState.loading ??
      usersQueryState.isLoading ??
      usersQueryState.isPending ??
      false,
  );
  const isMeetingActionLoading = (action: MeetingAction, meetingId: string) =>
    actionLoadingId === getMeetingActionKey(action, meetingId);

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

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const selectedDateKey = toDateKey(selectedDate);
  const currentMeetingForMenu =
    meetings.find((meeting) => meeting.id === openMenuId) ?? null;

  const openCreateModal = (date = selectedDateKey, hour = "09:00") => {
    const nextSlot = getNextHourSlot(date, hour);
    setOpenMenuId(null);
    setMenuPosition(null);
    setFormError("");
    setEditingMeeting(null);
    setForm({
      title: "",
      date,
      start: hour,
      end: nextSlot.time,
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
    const { endsAt, isValid } = resolveEndDateTime(
      form.date,
      form.start,
      form.end,
    );
    if (!isValid) {
      setFormError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    if (isPastDateTime(form.date, form.start)) {
      setFormError(
        "Impossible de créer ou modifier une réunion à une date déjà passée.",
      );
      return;
    }

    setIsSaving(true);
    setFormError("");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      startsAt: buildLocalDateTime(form.date, form.start),
      endsAt,
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

  const endMeeting = async (meetingId: string) => {
    setActionLoadingId(getMeetingActionKey("end", meetingId));
    try {
      await meetingService.end(meetingId);
      await meetingsQuery.refetch?.();
      setOpenMenuId(null);
      setMenuPosition(null);
      setOpenModal(false);
      setEditingMeeting(null);
      showToast("success", "Réunion terminée.");
    } catch (error) {
      console.error("Failed to end meeting", error);
      showToast("error", getErrorMessage(error));
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
      showToast("success", `${getUserLabel(user)} a été invité à la réunion.`);
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
    const roomName = meeting.roomName ?? extractMeetingRoomName(meeting.joinUrl);
    if (roomName) {
      window.location.assign(buildMeetingRoomUrl(roomName));
      return;
    }
    openEditModal(meeting);
  };

  const visibleUsers = useMemo(() => {
    const normalizedQuery = normalizeSearch(participantSearch.trim());
    if (!normalizedQuery) return users;
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
    setOpenMenuId(meetingId);
    setMenuPosition({
      top: Math.min(rect.bottom + gap, window.innerHeight - 120),
      left: Math.max(
        12,
        Math.min(
          rect.right - DROPDOWN_WIDTH,
          window.innerWidth - DROPDOWN_WIDTH - 12,
        ),
      ),
    });
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

  const closeParticipantsModal = () => {
    setAddParticipantsOpen(false);
    setSelectedMeetingForParticipants(null);
    setParticipantSearch("");
    setInvitingUserId(null);
  };

  return {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    openModal,
    setOpenModal,
    editingMeeting,
    form,
    setForm,
    formError,
    toast,
    meetings,
    isMeetingsLoading,
    isSaving,
    openMenuId,
    menuPosition,
    addParticipantsOpen,
    selectedMeetingForParticipants,
    participantSearch,
    setParticipantSearch,
    invitingUserId,
    usersLoading,
    usersError: usersQueryState.error,
    weekDays,
    selectedDateKey,
    currentMeetingForMenu,
    visibleUsers,
    showToast,
    openCreateModal,
    openEditModal,
    saveMeeting,
    endMeeting,
    handleAddParticipants,
    handleInviteParticipant,
    openMeetingRoom,
    toggleMeetingMenu,
    isMeetingActionLoading,
    goToday,
    goPrevious,
    goNext,
    closeParticipantsModal,
    refetchUsers: () => void usersQueryState.refetch?.(),
  };
}
