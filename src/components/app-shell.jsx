// Shared app chrome — sidebar + topbar used by all "inside-app" screens
// (Files, DM, Calendar, Profile, Admin, Notifications).
// Dashboard has its own inline version (was authored before this extract).

function AppShell({ active, children, topbarTitle, topbarBreadcrumb, topbarRight, hideSearch, contentPadding = 0 }) {
  const { dark, setDark } = useTheme();
  const P = getPalette(dark);

  const navItems = [
    { id: 'home',          icon: 'home',     label: 'Accueil' },
    { id: 'files',         icon: 'folder',   label: 'Fichiers',     count: 124 },
    { id: 'chat',          icon: 'message',  label: 'Chat',         count: 8, badge: 'accent' },
    { id: 'meetings',      icon: 'video',    label: 'Réunions',     count: 3 },
    { id: 'calendar',      icon: 'calendar', label: 'Calendrier' },
    { id: 'notifications', icon: 'bell',     label: 'Notifications', count: 5, badge: 'accent' },
    { id: 'settings',      icon: 'settings', label: 'Paramètres' },
  ];

  const NavItem = ({ id, icon, label, count, badge }) => {
    const isActive = active === id;
    return (
      <a href="#" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '9px 12px', borderRadius: 8,
        color: isActive ? P.text : P.mutedSoft,
        background: isActive ? P.surface2 : 'transparent',
        textDecoration: 'none', fontSize: 14,
        fontWeight: isActive ? 500 : 400, letterSpacing: '-0.01em',
      }}>
        <Icon name={icon} size={18} />
        <span style={{ flex: 1 }}>{label}</span>
        {count != null && (
          badge === 'accent' ? (
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: P.accent, color: '#fff', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
          ) : (
            <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
          )
        )}
      </a>
    );
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: P.bg, color: P.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'grid', gridTemplateColumns: '240px 1fr',
      letterSpacing: '-0.01em',
      ['--bg']: P.bg,
    }}>
      {/* ===== SIDEBAR ===== */}
      <aside style={{
        background: P.bg,
        borderRight: `1px solid ${P.border}`,
        padding: '24px 16px',
        display: 'flex', flexDirection: 'column', gap: 24,
        overflow: 'hidden',
      }}>
        {/* logo */}
        <div style={{ padding: '4px 6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <AcrediLockup size={22} fontSize={16} />
          <button style={{ background: 'transparent', border: 'none', padding: 2, cursor: 'pointer', color: P.muted }}>
            <Icon name="chevDown" size={14} />
          </button>
        </div>

        {/* primary nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => <NavItem key={item.id} {...item} />)}
        </nav>

        {/* workspaces */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between' }}>
            <span>Espaces</span>
            <Icon name="plus" size={12} />
          </div>
          {[
            { color: P.accent,  name: 'Direction' },
            { color: P.accent2, name: 'Produit' },
            { color: P.green,   name: 'Commercial' },
            { color: P.amber,   name: 'Design Studio' },
          ].map(w => (
            <a key={w.name} href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 6, color: P.mutedSoft, textDecoration: 'none', fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: w.color }} />
              {w.name}
            </a>
          ))}
        </div>

        {/* user footer */}
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${P.border}`, padding: '14px 8px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Mohamed Doumbia" size={32} presence="online" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Mohamed Doumbia</div>
            <div style={{ fontSize: 11, color: P.muted }}>Direction</div>
          </div>
          <button style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: P.muted }}>
            <Icon name="chevDown" size={14} />
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* topbar */}
        <header style={{
          height: 64, padding: '0 32px',
          borderBottom: `1px solid ${P.border}`,
          display: 'flex', alignItems: 'center', gap: 24,
          flex: 'none',
        }}>
          {topbarTitle || topbarBreadcrumb ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              {topbarBreadcrumb && (
                <div style={{ fontSize: 12, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', marginBottom: 2 }}>{topbarBreadcrumb}</div>
              )}
              {topbarTitle && (
                <div style={{ fontSize: 15, fontWeight: 600, color: P.text, letterSpacing: '-0.015em' }}>{topbarTitle}</div>
              )}
            </div>
          ) : null}

          {!hideSearch && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              flex: 1, maxWidth: 480,
              background: P.surface, border: `1px solid ${P.border}`,
              borderRadius: 8, padding: '8px 14px',
            }}>
              <Icon name="search" size={16} color={P.muted} />
              <input placeholder="Rechercher fichier, message, personne…" style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: P.text, fontSize: 13, fontFamily: 'inherit', letterSpacing: '-0.01em',
              }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: P.muted, border: `1px solid ${P.border}`, borderRadius: 4, padding: '1px 6px' }}>⌘K</span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          {topbarRight}

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setDark(!dark)} title={dark ? 'Mode clair' : 'Mode sombre'} style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: P.mutedSoft, borderRadius: 6 }}>
              <Icon name={dark ? 'sun' : 'moon'} size={18} />
            </button>
            <button style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: P.mutedSoft, borderRadius: 6, position: 'relative' }}>
              <Icon name="bell" size={18} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 99, background: P.red, boxShadow: `0 0 0 2px ${P.bg}` }} />
            </button>
            <span style={{ width: 1, height: 24, background: P.border, margin: '0 8px' }} />
            <Avatar name="Mohamed Doumbia" size={32} presence="online" />
          </div>
        </header>

        {/* content */}
        <div style={{ flex: 1, overflow: 'auto', padding: contentPadding }}>
          {children}
        </div>
      </div>
    </div>
  );
}

window.AppShell = AppShell;
