import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useWorkspace } from "../shared/context";
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

const pageMeta: Record<string, { title: string; crumb: string }> = {
  "/app/dashboard": { title: "Tableau de bord", crumb: "ACCUEIL" },
  "/app/files": { title: "Fichiers Acredi Space", crumb: "CONTENU" },
  "/app/chat": { title: "Canal equipe", crumb: "COLLABORATION" },
  "/app/dm": { title: "Messages directs", crumb: "COLLABORATION" },
  "/app/calendar": { title: "Calendrier", crumb: "PLANNING" },
  "/app/meeting": { title: "Salle de reunion", crumb: "VISIO" },
  "/app/profile": { title: "Mon profil", crumb: "PARAMETRES" },
  "/app/admin": { title: "Administration", crumb: "PARAMETRES" },
  "/app/teams": { title: "Teams", crumb: "COLLABORATION" },
  "/app/users": { title: "Users", crumb: "CRM" },
  "/app/notes": { title: "Notes", crumb: "CRM" },
  "/app/notifications": { title: "Centre de notifications", crumb: "ACTIVITE" },
};

interface NavItem {
  count?: number;
  accent?: boolean;
  icon: IconName;
  label: string;
  permissions: readonly PermissionCode[];
  to: string;
}

export function AppLayout() {
  const { user: authenticatedUser, logout } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const { counts, workspaces, activeWorkspace, setActiveWorkspaceId } =
    useWorkspace();
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSetting, setOpenSetting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    "notifications" | "account" | null
  >(null);
  const topbarActionsRef = useRef<HTMLDivElement | null>(null);
  const user = authenticatedUser!;
  const workspaceChannel: Record<string, string> = {
    direction: "general",
    product: "sprint-18",
    sales: "incidents-prod",
    design: "design-acredi",
  };

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
    // { to: '/app/notifications', icon: 'bell', label: 'Notifications', count: counts.notifications, accent: true },
  ];
  const visibleNavItems = navItems.filter((item) =>
    hasAnyPermission(item.permissions)
  );
  const canUseChat = hasAnyPermission(FEATURE_PERMISSION_REQUIREMENTS.chat);
  const canUseSettings = hasAnyPermission(
    FEATURE_PERMISSION_REQUIREMENTS.settings
  );
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
                {/* <span>Espaces</span> */}
                <Icon name="plus" size={12} />
              </div>
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  className={
                    workspace.id === activeWorkspace.id
                      ? "workspace active"
                      : "workspace"
                  }
                  type="button"
                  onClick={() => {
                    setActiveWorkspaceId(workspace.id);
                    navigate(
                      `/app/chat/${workspaceChannel[workspace.id] ?? "general"}`,
                    );
                  }}
                >
                  <span style={{ background: workspace.color }} />
                  {workspace.name}
                </button>
              ))}
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
                  onClick={() =>
                    setOpenDropdown((current) =>
                      current === "notifications" ? null : "notifications",
                    )
                  }
                >
                  <Icon name="bell" size={18} />
                  {counts.notifications > 0 ? <span /> : null}
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
                <Avatar name={user.name} size={32} presence={user.presence} />
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
                        </button>
                        <button type="button">Events</button>
                        <button type="button">What's New</button>
                      </div>
                      <div className="notifications-header-actions">
                        <button type="button" aria-label="Parametres">
                          <Icon name="settings" size={15} />
                        </button>
                        <button type="button" aria-label="Marquer comme lu">
                          <Icon name="check" size={15} />
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

                    <div className="notification-preview unread">
                      <span className="notification-unread-dot" />
                      <span className="notification-avatar">yh</span>
                      <p>
                        <strong>yann hallage</strong> assigned a new task{" "}
                        <b>CRM Task test</b> to you
                        <small>yesterday</small>
                      </p>
                    </div>

                    <button
                      className="notifications-activity"
                      type="button"
                      onClick={() => {
                        setOpenDropdown(null);
                        navigate("/app/notifications");
                      }}
                    >
                      See all Activity
                    </button>
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
          <ModalSetting
            userName={user.name}
            userEmail={user.email}
            workspaceName={activeWorkspace.name}
            onClose={() => setOpenSetting(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
