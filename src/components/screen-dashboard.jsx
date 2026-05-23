// ÉCRAN 2 — Dashboard
// Sidebar nav + topbar (search/notif/avatar) + 4 cards grid.

function ScreenDashboard() {
  const { dark } = useTheme();
  const P = getPalette(dark);
  const dbPalette = {
    bg: P.bg,
    surface: P.surface,
    surface2: P.surface2,
    border: P.border,
    borderSubtle: P.borderSubtle,
    text: P.text,
    muted: P.muted,
    mutedSoft: P.mutedSoft,
    accent: P.accent,
    accent2: P.accent2,
  };

  const navItems = [
    { icon: 'home',     label: 'Accueil',     active: true },
    { icon: 'folder',   label: 'Fichiers',    count: 124 },
    { icon: 'message',  label: 'Chat',        count: 8, badge: 'accent' },
    { icon: 'video',    label: 'Réunions',    count: 3 },
    { icon: 'calendar', label: 'Calendrier' },
    { icon: 'settings', label: 'Paramètres' },
  ];

  const NavItem = ({ icon, label, active, count, badge }) => (
    <a href="#" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '9px 12px',
      borderRadius: 8,
      color: active ? dbPalette.text : dbPalette.mutedSoft,
      background: active ? dbPalette.surface2 : 'transparent',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: active ? 500 : 400,
      letterSpacing: '-0.01em',
    }}>
      <Icon name={icon} size={18} />
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && (
        badge === 'accent' ? (
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: dbPalette.accent, color: '#fff', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
        ) : (
          <span style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
        )
      )}
    </a>
  );

  const Card = ({ title, action, children, style }) => (
    <section style={{
      background: dbPalette.surface,
      border: `1px solid ${dbPalette.border}`,
      borderRadius: 12,
      padding: 24,
      display: 'flex', flexDirection: 'column',
      ...style,
    }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', color: dbPalette.text }}>{title}</h3>
        {action || (
          <button style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: dbPalette.muted }}>
            <Icon name="moreH" size={16} />
          </button>
        )}
      </header>
      {children}
    </section>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      background: dbPalette.bg, color: dbPalette.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'grid', gridTemplateColumns: '240px 1fr',
      letterSpacing: '-0.01em',
      ['--bg']: dbPalette.bg,
    }}>
      {/* ===== SIDEBAR ===== */}
      <aside style={{
        background: dbPalette.bg,
        borderRight: `1px solid ${dbPalette.border}`,
        padding: '24px 16px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* logo + workspace switcher */}
        <div style={{ padding: '4px 6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <AcrediLockup size={22} fontSize={16} />
          <button style={{ background: 'transparent', border: 'none', padding: 2, cursor: 'pointer', color: dbPalette.muted }}>
            <Icon name="chevDown" size={14} />
          </button>
        </div>

        {/* primary nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => <NavItem key={item.label} {...item} />)}
        </nav>

        {/* workspaces */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: dbPalette.muted, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between' }}>
            <span>Espaces</span>
            <Icon name="plus" size={12} />
          </div>
          {[
            { color: '#5B6CFF', name: 'Direction' },
            { color: '#8B7FFF', name: 'Produit' },
            { color: '#22C55E', name: 'Commercial' },
            { color: '#F59E0B', name: 'Design Studio' },
          ].map(w => (
            <a key={w.name} href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 6, color: dbPalette.mutedSoft, textDecoration: 'none', fontSize: 13 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: w.color }} />
              {w.name}
            </a>
          ))}
        </div>

        {/* footer — current user */}
        <div style={{ marginTop: 'auto', borderTop: `1px solid ${dbPalette.border}`, padding: '14px 8px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Mohamed Doumbia" size={32} presence="online" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: dbPalette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Mohamed Doumbia</div>
            <div style={{ fontSize: 11, color: dbPalette.muted }}>Direction</div>
          </div>
          <button style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', color: dbPalette.muted }}>
            <Icon name="chevDown" size={14} />
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* topbar */}
        <header style={{
          height: 64, padding: '0 32px',
          borderBottom: `1px solid ${dbPalette.border}`,
          display: 'flex', alignItems: 'center', gap: 24,
          flex: 'none',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            flex: 1, maxWidth: 480,
            background: dbPalette.surface, border: `1px solid ${dbPalette.border}`,
            borderRadius: 8, padding: '8px 14px',
          }}>
            <Icon name="search" size={16} color={dbPalette.muted} />
            <input placeholder="Rechercher fichier, message, personne…" style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: dbPalette.text, fontSize: 13, fontFamily: 'inherit', letterSpacing: '-0.01em',
            }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: dbPalette.muted, border: `1px solid ${dbPalette.border}`, borderRadius: 4, padding: '1px 6px' }}>⌘K</span>
          </div>

          <div style={{ flex: 1 }} />

          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: dbPalette.accent, color: '#fff',
            border: 'none', borderRadius: 8, padding: '8px 14px',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <Icon name="plus" size={15} color="#fff" />
            Nouveau
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: dbPalette.mutedSoft, borderRadius: 6 }}>
              <Icon name="sun" size={18} />
            </button>
            <button style={{ background: 'transparent', border: 'none', padding: 8, cursor: 'pointer', color: dbPalette.mutedSoft, borderRadius: 6, position: 'relative' }}>
              <Icon name="bell" size={18} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 99, background: '#EF4444', boxShadow: `0 0 0 2px ${dbPalette.bg}` }} />
            </button>
            <span style={{ width: 1, height: 24, background: dbPalette.border, margin: '0 8px' }} />
            <Avatar name="Mohamed Doumbia" size={32} presence="online" />
          </div>
        </header>

        {/* main scroll area */}
        <div style={{ padding: 32, overflow: 'auto', flex: 1 }}>
          {/* page header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 12, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', marginBottom: 8 }}>JEUDI 21 MAI · 09:42</div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em' }}>Bonjour Mohamed.</h1>
              <p style={{ margin: '6px 0 0', color: dbPalette.muted, fontSize: 14 }}>Vous avez 3 réunions et 8 nouveaux messages aujourd'hui.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: dbPalette.surface, color: dbPalette.text, border: `1px solid ${dbPalette.border}`, borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="video" size={15} /> Démarrer une réunion
              </button>
            </div>
          </div>

          {/* === KPIs strip + Activity chart === */}
          {(() => {
            // sparkline helper — returns a path string normalized to box w×h
            const spark = (pts, w, h, padY = 4) => {
              const min = Math.min(...pts), max = Math.max(...pts);
              const range = max - min || 1;
              return pts.map((v, i) => {
                const x = (i / (pts.length - 1)) * w;
                const y = h - padY - ((v - min) / range) * (h - padY * 2);
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(' ');
            };
            const kpis = [
              { label: 'Réunions cette semaine', value: '47', delta: '+12%', up: true, data: [22, 28, 25, 31, 34, 41, 47], color: dbPalette.accent },
              { label: 'Fichiers actifs',         value: '1 284', delta: '+86', up: true, data: [1100, 1140, 1180, 1190, 1210, 1240, 1284], color: dbPalette.accent2 },
              { label: 'Messages envoyés',       value: '3 412', delta: '−4%', up: false, data: [3800, 3700, 3600, 3500, 3550, 3460, 3412], color: P.amber },
              { label: 'Membres actifs',         value: '38 / 42', delta: '+3', up: true, data: [30, 32, 33, 35, 35, 37, 38], color: P.green },
            ];
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {kpis.map((k, i) => (
                  <div key={i} style={{
                    background: dbPalette.surface, border: `1px solid ${dbPalette.border}`, borderRadius: 12,
                    padding: '18px 18px 0', display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden',
                  }}>
                    <div style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{k.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em', color: dbPalette.text }}>{k.value}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace',
                        color: k.up ? P.green : P.red,
                        background: k.up ? P.greenSoft : P.redSoft,
                        padding: '2px 7px', borderRadius: 99, letterSpacing: '0.02em',
                      }}>{k.delta}</span>
                    </div>
                    <svg viewBox="0 0 200 48" width="100%" height="44" style={{ marginTop: 4, display: 'block' }} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={k.color} stopOpacity="0.35" />
                          <stop offset="100%" stopColor={k.color} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={`${spark(k.data, 200, 48)} L 200 48 L 0 48 Z`} fill={`url(#spark-${i})`} stroke="none" />
                      <path d={spark(k.data, 200, 48)} fill="none" stroke={k.color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* === Activity chart — full width === */}
          {(() => {
            const days = [
              { d: 'Lun', meetings: 8,  messages: 412, files: 18 },
              { d: 'Mar', meetings: 11, messages: 538, files: 22 },
              { d: 'Mer', meetings: 6,  messages: 287, files: 14 },
              { d: 'Jeu', meetings: 12, messages: 624, files: 31 },
              { d: 'Ven', meetings: 9,  messages: 491, files: 26 },
              { d: 'Sam', meetings: 1,  messages: 64,  files: 3  },
              { d: 'Dim', meetings: 0,  messages: 28,  files: 1  },
            ];
            const maxMsg = Math.max(...days.map(d => d.messages));
            return (
              <section style={{
                background: dbPalette.surface, border: `1px solid ${dbPalette.border}`,
                borderRadius: 12, padding: 24, marginBottom: 20,
              }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: dbPalette.text }}>Activité de l'équipe</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: dbPalette.muted }}>7 derniers jours — messages, réunions, fichiers partagés</p>
                  </div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: dbPalette.muted }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: dbPalette.accent }} />messages</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: dbPalette.accent2 }} />réunions</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: P.amber }} />fichiers</span>
                    <button style={{ marginLeft: 8, background: 'transparent', color: dbPalette.text, border: `1px solid ${dbPalette.border}`, borderRadius: 6, padding: '5px 10px', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer' }}>7 jours ▾</button>
                  </div>
                </header>

                {/* bar chart */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 18, height: 180, alignItems: 'end' }}>
                  {days.map((d, i) => {
                    const msgH = (d.messages / maxMsg) * 100;
                    const mtgH = (d.meetings / 12) * 60;
                    const filH = (d.files / 35) * 35;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%' }}>
                        <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 4 }}>
                          <div style={{ flex: 1, height: `${msgH}%`, background: dbPalette.accent, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
                          <div style={{ flex: 1, height: `${mtgH}%`, background: dbPalette.accent2, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
                          <div style={{ flex: 1, height: `${filH}%`, background: P.amber, borderRadius: '4px 4px 0 0', minHeight: 2 }} />
                        </div>
                        <div style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>{d.d}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })()}

          {/* 4 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Card 1 — Activité récente */}
            <Card title="Activité récente">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { who: 'Yann Hallage',  what: 'a partagé', target: 'Brief identité v0.1.pdf', when: 'il y a 14 min', icon: 'file' },
                  { who: 'Issa Koné',     what: 'a commenté', target: 'Roadmap Q2 — production', when: '32 min', icon: 'message' },
                  { who: 'Mlle Yéo',      what: 'a terminé', target: 'Sprint #18 · login Angular', when: '1 h', icon: 'star' },
                  { who: 'Système',       what: 'a archivé', target: '12 fichiers anciens du canal #design', when: '3 h', icon: 'folder' },
                ].map((a, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={a.who} size={28} />
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: dbPalette.text }}>
                      <span style={{ fontWeight: 500 }}>{a.who}</span>
                      <span style={{ color: dbPalette.muted }}> {a.what} </span>
                      <span>{a.target}</span>
                    </div>
                    <span style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{a.when}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Card 2 — Prochaines réunions */}
            <Card title="Prochaines réunions">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { time: '10:30',  duration: '30 min', name: 'Daily Direction',         color: '#5B6CFF', attendees: ['Mohamed Doumbia', 'Yann Hallage', 'Issa Koné'], live: true },
                  { time: '14:00',  duration: '1 h',    name: 'Revue design Acredi Space', color: '#8B7FFF', attendees: ['Yann Hallage', 'Mlle Yéo'] },
                  { time: '16:30',  duration: '45 min', name: 'Sync clients · ACME',     color: '#22C55E', attendees: ['Mohamed Doumbia', 'Issa Koné'] },
                ].map((m, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '12px 14px', borderRadius: 8,
                    background: dbPalette.surface2, border: `1px solid ${dbPalette.borderSubtle}`,
                  }}>
                    <div style={{ width: 4, height: 36, borderRadius: 2, background: m.color, flex: 'none' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: dbPalette.text, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {m.name}
                        {m.live && <span style={{ fontSize: 10, color: '#EF4444', background: 'rgba(239,68,68,0.12)', padding: '1px 7px', borderRadius: 99, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>● live</span>}
                      </div>
                      <div style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', marginTop: 3 }}>
                        {m.time} · {m.duration}
                      </div>
                    </div>
                    <div style={{ display: 'flex' }}>
                      {m.attendees.map((a, j) => (
                        <span key={j} style={{ marginLeft: j === 0 ? 0 : -8 }}>
                          <Avatar name={a} size={24} ring={dbPalette.surface2} />
                        </span>
                      ))}
                    </div>
                    <button style={{ background: m.live ? dbPalette.accent : 'transparent', color: m.live ? '#fff' : dbPalette.text, border: m.live ? 'none' : `1px solid ${dbPalette.border}`, borderRadius: 6, padding: '6px 12px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                      {m.live ? 'Rejoindre' : 'Voir'}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Card 3 — Mes fichiers */}
            <Card title="Mes fichiers" action={
              <a href="#" style={{ fontSize: 12, color: dbPalette.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Voir tout <Icon name="chevRight" size={12} />
              </a>
            }>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { name: 'Brief identité v0.1.pdf',           size: '2.4 Mo', when: 'hier',     ext: 'pdf', color: '#EF4444' },
                  { name: 'Acredi Space — Design System.fig',  size: '18 Mo',  when: 'il y a 2 j', ext: 'fig', color: '#8B7FFF' },
                  { name: 'Roadmap Q2 — production.xlsx',      size: '124 Ko', when: 'il y a 3 j', ext: 'xls', color: '#22C55E' },
                  { name: 'Logo — exports SVG.zip',            size: '486 Ko', when: 'il y a 5 j', ext: 'zip', color: '#71717A' },
                  { name: 'Note interne — naming.md',          size: '12 Ko',  when: 'il y a 1 sem', ext: 'md',  color: '#5B6CFF' },
                ].map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 6 }}>
                    <span style={{
                      width: 30, height: 30, borderRadius: 6,
                      background: `${f.color}22`, color: f.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      flex: 'none',
                    }}>{f.ext}</span>
                    <span style={{ flex: 1, fontSize: 13, color: dbPalette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>{f.size}</span>
                    <span style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace', minWidth: 60, textAlign: 'right' }}>{f.when}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Card 4 — Équipe en ligne */}
            <Card title="Mon équipe en ligne" action={
              <span style={{ fontSize: 11, color: dbPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>6 / 12</span>
            }>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { name: 'Yann Hallage',      role: 'Directeur produit',  status: 'En réunion · Daily Direction', presence: 'busy' },
                  { name: 'Issa Koné',         role: 'Directeur technique', status: 'Disponible',                   presence: 'online' },
                  { name: 'Mlle Yéo',          role: 'Lead développeuse',   status: 'Concentration — ne pas déranger', presence: 'dnd' },
                  { name: 'Aïcha Bamba',       role: 'Designer UI',         status: 'Disponible',                   presence: 'online' },
                  { name: 'Kouadio Yao',       role: 'Chef de projet',      status: 'De retour à 14h',              presence: 'offline' },
                ].map((p, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 8px', borderRadius: 6 }}>
                    <Avatar name={p.name} size={32} presence={p.presence} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: dbPalette.text }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: dbPalette.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.status}</div>
                    </div>
                    <button style={{ background: 'transparent', border: 'none', padding: 6, cursor: 'pointer', color: dbPalette.muted, borderRadius: 6 }}>
                      <Icon name="message" size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

window.ScreenDashboard = ScreenDashboard;
