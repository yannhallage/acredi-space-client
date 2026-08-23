import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  useChannelMessagesSocket,
  useDmUnread,
} from "../shared/api/dm";
import {
  FEATURE_PERMISSION_REQUIREMENTS,
  getRoutePermissionRule,
  PermissionGate,
  usePermissions,
  type PermissionCode,
} from "../shared/permissions";
import { useTheme } from "../shared/theme";
import { AccessDeniedState, AcrediLockup, AcrediMark, Avatar, HoverTip, Icon, type IconName } from "../shared/ui";
import { ModalSetting } from "../features/settings/components";
import { DesktopNotificationBanner } from "../shared/notifications/DesktopNotificationBanner";
import { SidebarCurrentPlan } from "./SidebarCurrentPlan";
import { DESKTOP_NOTIFICATION_CLICK_EVENT } from "../shared/notifications/desktop";
import { getNotificationTarget } from "../shared/notifications/routing";
import { DiscussionsDock } from "./DiscussionsDock";

const pageMeta: Record<string, { title: string; crumb: string }> = {
  "/app/dashboard": { title: "Tableau de bord", crumb: "ACCUEIL" },
  "/app/shared-files": { title: "Fichiers partagés", crumb: "CONTENU" },
  "/app/trash": { title: "Corbeille", crumb: "CONTENU" },
  "/app/files": { title: "Fichiers Acredi Space", crumb: "CONTENU" },
  "/app/chat": { title: "Canal equipe", crumb: "COLLABORATION" },
  "/app/dm": { title: "Messages directs", crumb: "COLLABORATION" },
  "/app/mail": { title: "Mail", crumb: "COLLABORATION" },
  "/app/calendar": { title: "Calendrier", crumb: "PLANNING" },
  "/app/meeting": { title: "Réunions", crumb: "VISIO" },
  "/app/profile": { title: "Mon profil", crumb: "PARAMÈTRES" },
  "/app/admin": { title: "Administration", crumb: "PARAMÈTRES" },
  "/app/my-team": { title: "Mon équipe", crumb: "COLLABORATION" },
  "/app/teams": { title: "Équipes", crumb: "COLLABORATION" },
  "/app/users": { title: "Utilisateurs", crumb: "CRM" },
  "/app/notes": { title: "Notes", crumb: "CRM" },
  "/app/polls": { title: "Sondages", crumb: "CRM" },
};

const SIDEBAR_COLLAPSED_KEY = "acredi-sidebar-collapsed";

interface NavItem {
  canShow?: boolean;
  icon: IconName;
  isActive?: (pathname: string) => boolean;
  label: string;
  permissions: readonly PermissionCode[];
  to: string;
}

interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
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

export function AppLayout() {
  const { user: authenticatedUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const { hasAnyPermission } = usePermissions();
  const workspace = useWorkspace();
  const { dark, toggleTheme, palette } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSetting, setOpenSetting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const [openDropdown, setOpenDropdown] = useState<
    "notifications" | "account" | null
  >(null);
  const [readNotificationIds, setReadNotificationIds] = useState<
    Record<string, string>
  >({});
  const topbarActionsRef = useRef<HTMLDivElement | null>(null);
  const user = authenticatedUser!;
  const notificationReadStorageKey = `acredi-read-notifications:${user.id}`;
  const canShowAllTeams = canAccessAllTeams(user.adminRole);
  const canShowMyTeam = canAccessMyTeams(user.adminRole);
  const navSections: NavSection[] = [
    {
      id: "home",
      label: "Accueil",
      items: [
        {
          to: "/app/dashboard",
          icon: "home",
          label: "Tableau de bord",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.dashboard,
        },
      ],
    },
    {
      id: "content",
      label: "Contenu",
      items: [
        {
          to: "/app/files",
          icon: "folder",
          label: "Fichiers",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.files,
          isActive: (pathname) => pathname.startsWith("/app/files"),
        },
        {
          to: "/app/shared-files",
          icon: "share",
          label: "Partagés",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.files,
          isActive: (pathname) => pathname.startsWith("/app/shared-files"),
        },
        {
          to: "/app/trash",
          icon: "trash",
          label: "Corbeille",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.files,
          isActive: (pathname) => pathname.startsWith("/app/trash"),
        },
      ],
    },
    {
      id: "collaboration",
      label: "Collaboration",
      items: [
        {
          to: "/app/dm",
          icon: "message",
          label: "Messages",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.chat,
          isActive: (pathname) =>
            pathname.startsWith("/app/dm") || pathname.startsWith("/app/chat"),
        },
        // {
        //   to: "/app/mail",
        //   icon: "mail",
        //   label: "Mail",
        //   permissions: FEATURE_PERMISSION_REQUIREMENTS.chat,
        // },
        {
          to: "/app/meeting",
          icon: "video",
          label: "Réunions",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.meetings,
          isActive: (pathname) => pathname.startsWith("/app/meeting"),
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
          label: "Équipes",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.teams,
          canShow: canShowAllTeams,
        },
        {
          to: "/app/my-team",
          icon: "users",
          label: "Mon équipe",
          permissions: FEATURE_PERMISSION_REQUIREMENTS.myTeams,
          canShow: canShowMyTeam && !canShowAllTeams,
        },
      ],
    },
    {
      id: "crm",
      label: "CRM",
      items: [
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
        // {
        //   to: "/app/polls",
        //   icon: "poll",
        //   label: "Sondages",
        //   permissions: FEATURE_PERMISSION_REQUIREMENTS.polls,
        //   isActive: (pathname) => pathname.startsWith("/app/polls"),
        // },
      ],
    },
  ];
  const visibleNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.canShow !== false && hasAnyPermission(item.permissions)
      ),
    }))
    .filter((section) => section.items.length > 0);
  const canUseChat = hasAnyPermission(FEATURE_PERMISSION_REQUIREMENTS.chat);
  const activeDmId = location.pathname.startsWith("/app/dm/")
    ? location.pathname.split("/")[3] ?? null
    : null;
  const {
    privateChannelIds,
    unreadByChannelId,
    totalUnreadMessages,
  } = useDmUnread(canUseChat, activeDmId);
  useChannelMessagesSocket(privateChannelIds, activeDmId);
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
    "/app/shared-files",
    "/app/trash",
    "/app/meeting",
    "/app/calendar",
  ].some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

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
    function handleDesktopNotificationClick(event: Event) {
      const detail = (event as CustomEvent<{ path?: string }>).detail;
      const path = detail?.path;

      if (!path) {
        return;
      }

      navigate(path);
    }

    window.addEventListener(
      DESKTOP_NOTIFICATION_CLICK_EVENT,
      handleDesktopNotificationClick
    );

    return () => {
      window.removeEventListener(
        DESKTOP_NOTIFICATION_CLICK_EVENT,
        handleDesktopNotificationClick
      );
    };
  }, [navigate]);

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

  function handleToggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;

      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // Ignore storage errors (private mode, quota, etc.)
      }

      return next;
    });
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
      <div
        className={
          sidebarCollapsed ? "app-layout sidebar-collapsed" : "app-layout"
        }
      >
        <aside
          className={sidebarCollapsed ? "sidebar is-collapsed" : "sidebar"}
        >
          <div className="sidebar-brand">
            <div className="sidebar-brand-main">
              {sidebarCollapsed ? (
                <AcrediMark
                  size={32}
                  top={palette.markTop}
                  left={palette.accent2}
                  right={palette.accent}
                />
              ) : (
                <>
                  <div className="sidebar-brand-lockup">
                    <AcrediLockup size={42} fontSize={24} />
                    <SidebarCurrentPlan />
                  </div>
                  <span className="sidebar-workspace">{workspaceName}</span>
                </>
              )}
            </div>
          </div>

          <div className="sidebar-scroll">
            <nav className="primary-nav" aria-label="Navigation principale">
              {visibleNavSections.map((section) => (
                <div className="nav-section" key={section.id}>
                  {!sidebarCollapsed ? (
                    <p className="nav-section-label">{section.label}</p>
                  ) : (
                    <span className="nav-section-divider" aria-hidden="true" />
                  )}
                  {section.items.map((item) => {
                    return (
                      <HoverTip
                        key={`${item.to}-${item.label}`}
                        content={item.label}
                        disabled={!sidebarCollapsed}
                        side="right"
                      >
                        <NavLink
                          className={({ isActive }) => {
                            const active = item.isActive
                              ? item.isActive(location.pathname)
                              : isActive;

                            return active ? "nav-link active" : "nav-link";
                          }}
                          to={item.to}
                          aria-label={
                            sidebarCollapsed ? item.label : undefined
                          }
                        >
                          <Icon name={item.icon} size={18} />
                          <span>{item.label}</span>
                        </NavLink>
                      </HoverTip>
                    );
                  })}
                </div>
              ))}

              {canUseSettings ? (
                <div className="nav-section nav-section-settings">
                  {!sidebarCollapsed ? (
                    <p className="nav-section-label">Système</p>
                  ) : (
                    <span className="nav-section-divider" aria-hidden="true" />
                  )}
                  <HoverTip
                    content="Paramètres"
                    disabled={!sidebarCollapsed}
                    side="right"
                  >
                    <button
                      className={openSetting ? "nav-link active" : "nav-link"}
                      type="button"
                      aria-haspopup="dialog"
                      aria-expanded={openSetting}
                      aria-label={sidebarCollapsed ? "Paramètres" : undefined}
                      onClick={() => setOpenSetting(true)}
                    >
                      <Icon name="settings" size={18} />
                      <span>Paramètres</span>
                    </button>
                  </HoverTip>
                </div>
              ) : null}
            </nav>
          </div>

          <div className="sidebar-footer">
            <HoverTip
              content={
                sidebarCollapsed
                  ? "Développer la navigation"
                  : "Réduire la navigation"
              }
              side="right"
            >
              <button
                className="nav-link sidebar-collapse-btn"
                type="button"
                aria-label={
                  sidebarCollapsed
                    ? "Développer la navigation"
                    : "Réduire la navigation"
                }
                onClick={handleToggleSidebar}
              >
                <Icon
                  name={sidebarCollapsed ? "arrowRight" : "arrowLeft"}
                  size={18}
                />
                <span>Réduire</span>
              </button>
            </HoverTip>
          </div>
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
              {/* <PermissionGate permissions={FEATURE_PERMISSION_REQUIREMENTS.chat}>
                <a
                  className="icon-button gmail-link"
                  href="/app/mail"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Ouvrir Gmail"
                  title="Gmail"
                >
                  <img src="/gmail-logo.svg" alt="" aria-hidden="true" />
                </a>
              </PermissionGate> */}
              <a
                className="icon-button nuum-link"
                href="https://app.nuum-ci.com/authentification"
                target="_blank"
                rel="noreferrer"
                aria-label="Ouvrir Nuum"
              >
                <img
                  src={dark ? "/nuum-sm-logo-white.svg" : "/nuum-sm-logo.svg"}
                  alt=""
                  aria-hidden="true"
                />
              </a>
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

                                setOpenDropdown(null);

                                if (target) {
                                  navigate(target);
                                }
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
                      Modifier le profil
                    </button>
                    {canUseSettings ? (
                      <button
                        className="account-menu-item"
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenDropdown(null);
                          setOpenSetting(true);
                        }}
                      >
                        <Icon name="settings" size={16} />
                        Paramètres
                      </button>
                    ) : null}
                    <button
                      className="account-menu-item"
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <Icon name="logOut" size={16} />
                      Déconnexion
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </header>

          <DesktopNotificationBanner />

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

      {canUseChat ? (
        <DiscussionsDock
          newDiscussionsCount={totalUnreadMessages}
          unreadByChannelId={unreadByChannelId}
        />
      ) : null}

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