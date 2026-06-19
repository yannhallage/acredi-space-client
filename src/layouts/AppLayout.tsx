import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMyDiscussions } from "../shared/api/discussions";
import { useAuth, useWorkspace } from "../shared/context";
import { canAccessAllTeams, canAccessMyTeams } from "../features/teams/access";
import {
  dashboardKeys,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useDashboardNotifications,
  type DashboardNotification,
} from "../shared/api/dashboard";
import {
  FEATURE_PERMISSION_REQUIREMENTS,
  getRoutePermissionRule,
  PermissionGate,
  usePermissions,
  type PermissionCode,
} from "../shared/permissions";
import { useTheme } from "../shared/theme";
import { AccessDeniedState, AcrediLockup, Avatar, Icon, type IconName } from "../shared/ui";
import ModalSetting from "../shared/others/ModalSetting";
import { playNotificationSound } from "../shared/notifications/sound";

const pageMeta: Record<string, { title: string; crumb: string }> = {
  "/app/dashboard": { title: "Tableau de bord", crumb: "ACCUEIL" },
  "/app/files": { title: "Fichiers Acredi Space", crumb: "CONTENU" },
  "/app/chat": { title: "Canal equipe", crumb: "COLLABORATION" },
  "/app/dm": { title: "Messages directs", crumb: "COLLABORATION" },
  "/app/calendar": { title: "Calendrier", crumb: "PLANNING" },
  "/app/meeting": { title: "Salle de reunion", crumb: "VISIO" },
  "/app/profile": { title: "Mon profil", crumb: "PARAMETRES" },
  "/app/admin": { title: "Administration", crumb: "PARAMETRES" },
  "/app/my-team": { title: "My Team", crumb: "COLLABORATION" },
  "/app/teams": { title: "Teams", crumb: "COLLABORATION" },
  "/app/users": { title: "Users", crumb: "CRM" },
  "/app/notes": { title: "Notes", crumb: "CRM" },
};

interface NavItem {
  canShow?: boolean;
  count?: number;
  accent?: boolean;
  icon: IconName;
  label: string;
  permissions: readonly PermissionCode[];
  to: string;
}

const notificationSkeletons = [
  "notification-skeleton-1",
  "notification-skeleton-2",
  "notification-skeleton-3",
];

function formatNotificationTime(date: Date | null) {
  if (!date) {
    return "Date inconnue";
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "a l'instant";
  }

  if (diffMinutes < 60) {
    return `il y a ${diffMinutes} min`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `il y a ${diffHours} h`;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getNotificationInitials(notification: DashboardNotification) {
  const source = notification.type || notification.title || "NO";
  const letters = source.replace(/[^a-z0-9]/gi, "").slice(0, 2);

  return (letters || "NO").toUpperCase();
}

// function getNotificationTarget(notification: DashboardNotification) {
//   if (notification.linkUrl) {
//     return notification.linkUrl;
//   }

//   const type = notification.type.toUpperCase();

//   if (type.includes("FILE")) {
//     return "/app/files";
//   }

//   if (type.includes("MEETING")) {
//     return "/app/meeting/meet-daily";
//   }

//   if (type.includes("MESSAGE") || type.includes("CHAT")) {
//     return "/app/chat/general";
//   }

//   return null;
// }


type NotificationMetadata = {
  channelId?: string | null;
  conversationId?: string | null;
  discussionId?: string | null;
  meetingId?: string | null;
  fileId?: string | null;
  folderId?: string | null;
  noteId?: string | null;
  entityId?: string | null;
  targetId?: string | null;
};

function getNotificationMetadata(notification: DashboardNotification) {
  const item = notification as DashboardNotification & {
    metadata?: NotificationMetadata | null;
    data?: NotificationMetadata | null;
    payload?: NotificationMetadata | null;
    channelId?: string | null;
    conversationId?: string | null;
    discussionId?: string | null;
    meetingId?: string | null;
    fileId?: string | null;
    folderId?: string | null;
    noteId?: string | null;
    entityId?: string | null;
    targetId?: string | null;
  };

  return item.metadata ?? item.data ?? item.payload ?? item;
}

function getNotificationTarget(notification: DashboardNotification) {
  if (notification.linkUrl) {
    return notification.linkUrl;
  }

  const metadata = getNotificationMetadata(notification);
  const type = notification.type?.toUpperCase() ?? "";
  const title = `${notification.title ?? ""} ${notification.message ?? ""}`.toUpperCase();

  const conversationId =
    metadata.conversationId ??
    metadata.channelId ??
    metadata.entityId ??
    metadata.targetId;

  const discussionId =
    metadata.discussionId ??
    metadata.channelId ??
    metadata.entityId ??
    metadata.targetId;

  const meetingId =
    metadata.meetingId ??
    metadata.entityId ??
    metadata.targetId;

  if (type.includes("DIRECT") || type.includes("DM")) {
    return conversationId ? `/app/dm/${conversationId}` : "/app/dm";
  }

  if (
    type.includes("GROUP") ||
    type.includes("DISCUSSION") ||
    type.includes("CHAT") ||
    type.includes("MESSAGE")
  ) {
    if (title.includes("YANN") && conversationId) {
      return `/app/dm/${conversationId}`;
    }

    return discussionId ? `/app/chat/${discussionId}` : "/app/chat";
  }

  if (type.includes("MEETING") || type.includes("REUNION")) {
    return meetingId ? `/app/meeting/${meetingId}` : "/app/meeting/meet-daily";
  }

  if (type.includes("FILE") || type.includes("FICHIER")) {
    if (metadata.folderId) {
      return `/app/files/${metadata.folderId}`;
    }

    if (metadata.fileId) {
      return `/app/files?fileId=${metadata.fileId}`;
    }

    return "/app/files";
  }

  if (type.includes("NOTE")) {
    return metadata.noteId ? `/app/notes?noteId=${metadata.noteId}` : "/app/notes";
  }

  return "/app/dashboard";
}

export function AppLayout() {
  const { user: authenticatedUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const { hasAnyPermission } = usePermissions();
  // const { counts } = useWorkspace();
  const workspace = useWorkspace();
  const { counts } = workspace;
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSetting, setOpenSetting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    "notifications" | "account" | null
  >(null);
  const [readNotificationIds, setReadNotificationIds] = useState<
    Record<string, string>
  >({});
  const topbarActionsRef = useRef<HTMLDivElement | null>(null);
  const knownNotificationIdsRef = useRef<Set<string> | null>(null);
  const user = authenticatedUser!;
  const notificationReadStorageKey = `acredi-read-notifications:${user.id}`;
  const navItems: NavItem[] = [
    {
      to: "/app/dashboard",
      icon: "home",
      label: "Accueil",
      permissions: FEATURE_PERMISSION_REQUIREMENTS.dashboard,
    },
    {
      to: "/app/files",
      icon: "folder",
      label: "Fichiers",
      count: counts.files,
      permissions: FEATURE_PERMISSION_REQUIREMENTS.files,
    },
    {
      to: "/app/dm/dm-yann",
      icon: "message",
      label: "Chat",
      count: counts.unreadMessages,
      accent: true,
      permissions: FEATURE_PERMISSION_REQUIREMENTS.chat,
    },
    {
      to: "/app/meeting/meet-daily",
      icon: "video",
      label: "Reunions",
      count: counts.liveMeetings,
      accent: true,
      permissions: FEATURE_PERMISSION_REQUIREMENTS.meetings,
    },
    {
      to: "/app/calendar",
      icon: "calendar",
      label: "Calendrier",
      permissions: FEATURE_PERMISSION_REQUIREMENTS.calendar,
    },
    {
      to: "/app/teams",
      icon: "building",
      label: "Teams",
      permissions: FEATURE_PERMISSION_REQUIREMENTS.teams,
      canShow: canAccessAllTeams(user.adminRole),
    },
    {
      to: "/app/my-team",
      icon: "users",
      label: "My Team",
      permissions: FEATURE_PERMISSION_REQUIREMENTS.myTeams,
      canShow: canAccessMyTeams(user.adminRole),
    },
    {
      to: "/app/users",
      icon: "users",
      label: "Utilisateurs",
      permissions: FEATURE_PERMISSION_REQUIREMENTS.users,
    },
    {
      to: "/app/notes",
      icon: "notes",
      label: "Notes",
      permissions: FEATURE_PERMISSION_REQUIREMENTS.notes,
    },
  ];
  const visibleNavItems = navItems.filter(
    (item) => item.canShow !== false && hasAnyPermission(item.permissions)
  );
  const canUseChat = hasAnyPermission(FEATURE_PERMISSION_REQUIREMENTS.chat);
  const myDiscussionsQuery = useMyDiscussions({ enabled: canUseChat });
  const canUseSettings = hasAnyPermission(
    FEATURE_PERMISSION_REQUIREMENTS.settings
  );
  const canReadNotifications = hasAnyPermission(
    FEATURE_PERMISSION_REQUIREMENTS.notifications
  );
  const notificationsQuery = useDashboardNotifications(canReadNotifications);
  const markNotificationReadMutation = useMarkNotificationRead();
  const markAllNotificationsReadMutation = useMarkAllNotificationsRead();
  const notifications = useMemo(
    () =>
      (notificationsQuery.data ?? []).map((notification) => {
        if (notification.readAt || !readNotificationIds[notification.id]) {
          return notification;
        }

        const readAt = new Date(readNotificationIds[notification.id]);

        return {
          ...notification,
          readAt: Number.isNaN(readAt.getTime()) ? new Date() : readAt,
        };
      }),
    [notificationsQuery.data, readNotificationIds]
  );
  const recentNotifications = [...notifications]
    .sort(
      (a, b) =>
        (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    )
    .slice(0, 5);
  const unreadNotifications = notifications.filter(
    (notification) => !notification.readAt
  ).length;
  const isNotificationsFetching =
    canReadNotifications &&
    !notificationsQuery.isError &&
    (notificationsQuery.isPending ||
      notificationsQuery.isLoading ||
      notificationsQuery.isFetching);
  const routePermissionRule = getRoutePermissionRule(location.pathname);
  const canAccessCurrentRoute =
    !routePermissionRule || hasAnyPermission(routePermissionRule.permissions);

  const metaKey =
    Object.keys(pageMeta).find((path) => location.pathname.startsWith(path)) ??
    "/app/dashboard";
  const meta = pageMeta[metaKey];
  const fullBleedContent = [
    "/app/chat",
    "/app/dm",
    "/app/files",
    "/app/meeting",
    "/app/calendar",
  ].some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    knownNotificationIdsRef.current = null;
  }, [user.id]);

  useEffect(() => {
    try {
      const storedReadIds = localStorage.getItem(notificationReadStorageKey);
      setReadNotificationIds(
        storedReadIds ? JSON.parse(storedReadIds) : {}
      );
    } catch {
      setReadNotificationIds({});
    }
  }, [notificationReadStorageKey]);

  useEffect(() => {
    if (
      !canReadNotifications ||
      notificationsQuery.isError ||
      !notificationsQuery.data
    ) {
      return;
    }

    const currentIds = new Set(
      notificationsQuery.data.map((notification) => notification.id)
    );
    const knownIds = knownNotificationIdsRef.current;

    if (!knownIds) {
      knownNotificationIdsRef.current = currentIds;
      return;
    }

    const hasNewNotification = notificationsQuery.data.some(
      (notification) => !knownIds.has(notification.id)
    );

    knownNotificationIdsRef.current = currentIds;

    if (hasNewNotification) {
      playNotificationSound();
    }
  }, [canReadNotifications, notificationsQuery.data, notificationsQuery.isError]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        topbarActionsRef.current &&
        !topbarActionsRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleLogout() {
    setOpenDropdown(null);
    logout();
    navigate("/login", { replace: true });
  }

  function handleMarkAllNotificationsRead() {
    const readAt = new Date();
    const readAtIso = readAt.toISOString();
    const nextReadNotificationIds = { ...readNotificationIds };

    notifications.forEach((notification) => {
      nextReadNotificationIds[notification.id] =
        notification.readAt?.toISOString() ?? readAtIso;
    });

    setReadNotificationIds(nextReadNotificationIds);
    localStorage.setItem(
      notificationReadStorageKey,
      JSON.stringify(nextReadNotificationIds)
    );

    queryClient.setQueryData<DashboardNotification[]>(
      dashboardKeys.notifications(),
      (current) =>
        current?.map((notification) => ({
          ...notification,
          readAt: notification.readAt ?? readAt,
        })) ?? current
    );

    markAllNotificationsReadMutation.mutate();
  }

  function handleMarkNotificationRead(notification: DashboardNotification) {
    if (notification.readAt) {
      return;
    }

    const readAt = new Date();
    const nextReadNotificationIds = {
      ...readNotificationIds,
      [notification.id]: readAt.toISOString(),
    };

    setReadNotificationIds(nextReadNotificationIds);
    localStorage.setItem(
      notificationReadStorageKey,
      JSON.stringify(nextReadNotificationIds)
    );

    queryClient.setQueryData<DashboardNotification[]>(
      dashboardKeys.notifications(),
      (current) =>
        current?.map((item) =>
          item.id === notification.id ? { ...item, readAt } : item
        ) ?? current
    );

    markNotificationReadMutation.mutate(notification.id);
  }


  const workspaceName =
  "activeWorkspace" in workspace &&
  workspace.activeWorkspace &&
  typeof workspace.activeWorkspace === "object" &&
  "name" in workspace.activeWorkspace
    ? String(workspace.activeWorkspace.name)
    : "Acredi Space";

  return (
    <>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <AcrediLockup size={22} fontSize={16} />
            <button
              className="icon-button"
              type="button"
              aria-label="Changer espace"
            >
              <Icon name="chevDown" size={14} />
            </button>
          </div>

          <nav className="primary-nav" aria-label="Navigation principale">
            {visibleNavItems.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                className="nav-link"
                to={item.to}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.count !== undefined ? (
                  <small
                    className={
                      item.accent ? "nav-count nav-count-accent" : "nav-count"
                    }
                  >
                    {item.count}
                  </small>
                ) : null}
              </NavLink>
            ))}

            {canUseSettings ? (
              <button
                className={openSetting ? "nav-link active" : "nav-link"}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={openSetting}
                onClick={() => setOpenSetting(true)}
              >
                <Icon name="settings" size={18} />
                <span>Parametres</span>
              </button>
            ) : null}
          </nav>

          {canUseChat ? (
            <div className="workspace-list">
              <div className="eyebrow-row">
                <span>Equipes</span>
                {/* <Icon name="plus" size={12} /> */}
              </div>
              {myDiscussionsQuery.isLoading ? (
                notificationSkeletons.map((item) => (
                  <span className="skeleton-line workspace-skeleton" key={item} />
                ))
              ) : myDiscussionsQuery.isError ? (
                <p className="muted workspace-error">Discussions indisponibles</p>
              ) : (myDiscussionsQuery.data ?? []).length ? (
                (myDiscussionsQuery.data ?? []).map((discussion) => {
                  const isActive = location.pathname.startsWith(
                    `/app/chat/${discussion.id}`
                  );

                  return (
                    <button
                      key={discussion.id}
                      className={isActive ? "workspace active" : "workspace"}
                      type="button"
                      onClick={() => {
                        navigate(`/app/chat/${discussion.id}`);
                      }}
                    >
                      <span
                        style={{
                          background: discussion.teamColor ?? "#6366F1",
                        }}
                      />
                      {discussion.name}
                    </button>
                  );
                })
              ) : (
                <p className="muted workspace-empty">Aucune discussion</p>
              )}
            </div>
          ) : null}
        </aside>

        <div className="app-main">
          <header className="topbar">
            <div className="topbar-title">
              <span>{meta.crumb}</span>
              <strong>{meta.title}</strong>
            </div>
            {/* <label className="search-box">
            <Icon name="search" size={16} />
            <input placeholder="Rechercher fichier, message, personne..." />
            <kbd>Ctrl K</kbd>
          </label> */}
            <div className="topbar-actions" ref={topbarActionsRef}>
              {/* <NavLink className="button ghost" to="/preview">
              <Icon name="eye" size={15} />
              Preview
            </NavLink> */}
              {/* <button className="button primary" type="button">
              <Icon name="plus" size={15} />
              Nouveau
            </button> */}
              <button
                className="icon-button"
                type="button"
                onClick={toggleTheme}
                aria-label="Changer le theme"
              >
                <Icon name={dark ? "sun" : "moon"} size={18} />
              </button>
              <PermissionGate
                permissions={FEATURE_PERMISSION_REQUIREMENTS.notifications}
              >
                <button
                  className={
                    openDropdown === "notifications"
                      ? "icon-button notification-button active"
                      : "icon-button notification-button"
                  }
                  type="button"
                  aria-label="Notifications"
                  aria-haspopup="dialog"
                  aria-expanded={openDropdown === "notifications"}
                  onClick={() => {
                    const willOpen = openDropdown !== "notifications";

                    setOpenDropdown(willOpen ? "notifications" : null);

                    if (willOpen) {
                      notificationsQuery.refetch().catch(() => undefined);
                    }
                  }}
                >
                  <Icon name="bell" size={18} />
                  {unreadNotifications > 0 ? (
                    <span className="notification-count-badge">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </span>
                  ) : null}
                </button>
              </PermissionGate>
              <button
                className={
                  openDropdown === "account"
                    ? "account-button active"
                    : "account-button"
                }
                type="button"
                aria-label="Menu du profil"
                aria-haspopup="menu"
                aria-expanded={openDropdown === "account"}
                onClick={() =>
                  setOpenDropdown((current) =>
                    current === "account" ? null : "account",
                  )
                }
              >
                <Avatar name={user.name} size={32} presence={user.presence} src={user.avatarUrl} />
              </button>

              <AnimatePresence>
                {openDropdown === "notifications" ? (
                  <motion.div
                    key="notifications-popover"
                    className="topbar-popover notifications-popover"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="notifications-popover-header">
                      <div className="notifications-tabs" role="tablist">
                        <button className="active" type="button">
                          Notifications
                          {unreadNotifications > 0 ? (
                            <span className="notifications-count">
                              {unreadNotifications}
                            </span>
                          ) : null}
                        </button>
                      </div>
                      <div className="notifications-header-actions">
                        <button
                          type="button"
                          aria-label="Tout marquer comme lu"
                          disabled={
                            unreadNotifications === 0 ||
                            markAllNotificationsReadMutation.isPending
                          }
                          onClick={handleMarkAllNotificationsRead}
                        >
                          <Icon name="check" size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label="Rafraichir"
                          onClick={() => {
                            notificationsQuery.refetch().catch(() => undefined);
                          }}
                        >
                          <Icon name="refresh" size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label="Fermer"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Icon name="x" size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="notifications-list">
                      {isNotificationsFetching
                        ? notificationSkeletons.map((item) => (
                            <div
                              className="notification-preview notification-preview-skeleton"
                              key={item}
                              aria-hidden="true"
                            >
                              <span className="notification-unread-dot" />
                              <span className="notification-avatar skeleton-avatar" />
                              <p>
                                <span className="skeleton-line" />
                                <span className="skeleton-line skeleton-short" />
                              </p>
                            </div>
                          ))
                        : null}

                      {!isNotificationsFetching && notificationsQuery.isError ? (
                        <div className="notifications-empty">
                          <Icon name="alert" size={16} />
                          <strong>Impossible de charger</strong>
                          <small>Reessayez dans un instant.</small>
                        </div>
                      ) : null}

                      {!isNotificationsFetching &&
                      !notificationsQuery.isError &&
                      recentNotifications.length === 0 ? (
                        <div className="notifications-empty">
                          <Icon name="bell" size={16} />
                          <strong>Aucune notification</strong>
                          <small>Les nouvelles alertes apparaitront ici.</small>
                        </div>
                      ) : null}

                      {!isNotificationsFetching && !notificationsQuery.isError
                        ? recentNotifications.map((notification) => (
                            <button
                              className={
                                notification.readAt
                                  ? "notification-preview"
                                  : "notification-preview unread"
                              }
                              key={notification.id}
                              type="button"
                              onClick={() => {
                                handleMarkNotificationRead(notification);
                                const target = getNotificationTarget(notification);

                                if (!target) {
                                  return;
                                }

                                setOpenDropdown(null);
                                navigate(target);
                              }}
                            >
                              <span className="notification-unread-dot" />
                              <span className="notification-avatar">
                                {getNotificationInitials(notification)}
                              </span>
                              <p>
                                <strong>{notification.title}</strong>
                                <span>{notification.message}</span>
                                <small>
                                  {formatNotificationTime(notification.createdAt)}
                                </small>
                              </p>
                            </button>
                          ))
                        : null}
                    </div>
                  </motion.div>
                ) : null}

                {openDropdown === "account" ? (
                  <motion.div
                    key="account-popover"
                    className="topbar-popover account-popover"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: "easeOut" }}
                    role="menu"
                    aria-label="Menu du profil"
                  >
                    <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate("/app/profile");
                      }}
                    >
                      <Icon name="edit" size={16} />
                      Edit Profile
                    </button>
                    {/* <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        toggleTheme();
                        setOpenDropdown(null);
                      }}
                    >
                      <Icon name="moon" size={16} />
                      Toggle Theme
                    </button> */}
                    {/* <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <Icon name="alert" size={16} />
                      About
                    </button> */}
                    {/* <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <Icon name="phoneOff" size={16} />
                      Frappe Support
                    </button> */}
                    {/* <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <Icon name="refresh" size={16} />
                      Reset Desktop Layout
                    </button> */}
                    <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <Icon name="logOut" size={16} />
                      Logout
                    </button>
                    {/* <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={() => setOpenDropdown(null)}
                    >
                      <Icon name="file" size={16} />
                      Manage Billing
                    </button> */}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </header>

          <main
            className={fullBleedContent ? "content content-full" : "content"}
          >
            {canAccessCurrentRoute ? (
              <Outlet />
            ) : (
              <AccessDeniedState />
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {openSetting ? (
          // <ModalSetting
          //   userName={user.name}
          //   userEmail={user.email}
          //   workspaceName={activeWorkspace.name}
          //   onClose={() => setOpenSetting(false)}
          // />

          <ModalSetting
          userName={user.name}
          userEmail={user.email}
          workspaceName={workspaceName}
          onClose={() => setOpenSetting(false)}
/>
        ) : null}
      </AnimatePresence>
    </>
  );
}
