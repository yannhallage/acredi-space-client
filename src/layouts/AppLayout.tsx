import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useWorkspace } from "../shared/context";
import { useTheme } from "../shared/theme";
import { AcrediLockup, Avatar, Icon, type IconName } from "../shared/ui";
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
  "/app/notifications": { title: "Centre de notifications", crumb: "ACTIVITE" },
};

interface NavItem {
  to: string;
  icon: IconName;
  label: string;
  count?: number;
  accent?: boolean;
}

export function AppLayout() {
  const { user: authenticatedUser } = useAuth();
  const { counts, workspaces, activeWorkspace, setActiveWorkspaceId } =
    useWorkspace();
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openSetting, setOpenSetting] = useState(false);
  const user = authenticatedUser!;
  const workspaceChannel: Record<string, string> = {
    direction: "general",
    product: "sprint-18",
    sales: "incidents-prod",
    design: "design-acredi",
  };

  const navItems: NavItem[] = [
    { to: "/app/dashboard", icon: "home", label: "Accueil" },
    {
      to: "/app/files",
      icon: "folder",
      label: "Fichiers",
      count: counts.files,
    },
    {
      to: "/app/dm/dm-yann",
      icon: "message",
      label: "Chat",
      count: counts.unreadMessages,
      accent: true,
    },
    {
      to: "/app/meeting/meet-daily",
      icon: "video",
      label: "Reunions",
      count: counts.liveMeetings,
      accent: true,
    },
    { to: "/app/calendar", icon: "calendar", label: "Calendrier" },
    { to: "/app/admin", icon: "users", label: "Utilisateurs" },
    { to: "/app/admin", icon: "notes", label: "Notes" },
    // { to: '/app/notifications', icon: 'bell', label: 'Notifications', count: counts.notifications, accent: true },
  ];

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
            {navItems.map((item) => (
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
          </nav>

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
            <div className="topbar-actions">
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
              <NavLink
                className="icon-button notification-button"
                to="/app/notifications"
                aria-label="Notifications"
              >
                <Icon name="bell" size={18} />
                {counts.notifications > 0 ? <span /> : null}
              </NavLink>
              <Avatar name={user.name} size={32} presence={user.presence} />
            </div>
          </header>

          <main
            className={fullBleedContent ? "content content-full" : "content"}
          >
            <Outlet />
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
