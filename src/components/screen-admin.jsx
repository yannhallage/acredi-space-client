// ÉCRAN 09 — Paramètres administrateur
// Sidebar paramètres + table utilisateurs + audit logs.

function ScreenAdmin() {
  const { dark } = useTheme();
  const P = getPalette(dark);

  const users = [
    { name: 'Mohamed Doumbia', email: 'mohamed.doumbia@a-credi.com',  role: 'Admin',       last: 'à l\'instant',   presence: 'online',  badge: 'Direction',  twoFa: true },
    { name: 'Yann Hallage',    email: 'yann.hallage@a-credi.com',     role: 'Admin',       last: 'il y a 8 min',    presence: 'online',  badge: 'Produit',    twoFa: true },
    { name: 'Issa Koné',       email: 'issa.kone@a-credi.com',        role: 'Admin',       last: 'il y a 14 min',   presence: 'online',  badge: 'Tech',       twoFa: true },
    { name: 'Mlle Yéo',        email: 'yeo@a-credi.com',              role: 'Membre',      last: 'il y a 1 h',      presence: 'dnd',     badge: 'Tech',       twoFa: true },
    { name: 'Aïcha Bamba',     email: 'aicha.bamba@a-credi.com',      role: 'Membre',      last: 'il y a 32 min',   presence: 'online',  badge: 'Design',     twoFa: false },
    { name: 'Kouadio Yao',     email: 'kouadio.yao@a-credi.com',      role: 'Membre',      last: 'hier',            presence: 'offline', badge: 'Commercial', twoFa: false },
    { name: 'Fatou Diallo',    email: 'fatou.diallo@a-credi.com',     role: 'Membre',      last: 'hier',            presence: 'offline', badge: 'Commercial', twoFa: true },
    { name: 'Adjoua Konan',    email: 'adjoua.konan@a-credi.com',     role: 'Invité',      last: 'il y a 3 j',      presence: 'offline', badge: 'Externe',    twoFa: false },
    { name: 'Ousmane Touré',   email: 'ousmane.toure@a-credi.com',    role: 'Membre',      last: 'il y a 5 j',      presence: 'offline', badge: 'Commercial', twoFa: true },
    { name: 'Awa Bocoum',      email: 'awa.bocoum@a-credi.com',       role: 'Désactivé',   last: 'il y a 2 sem',    presence: 'offline', badge: '—',          twoFa: false },
  ];

  const roleColors = {
    Admin:     P.accent,
    Membre:    P.text,
    Invité:    P.amber,
    Désactivé: P.muted,
  };

  return (
    <AppShell active="settings" topbarBreadcrumb="PARAMÈTRES" topbarTitle="Administration — Acredi Space" hideSearch>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: '100%' }}>

        {/* ===== SETTINGS SIDEBAR ===== */}
        <aside style={{ borderRight: `1px solid ${P.border}`, padding: '24px 16px', overflow: 'auto' }}>
          {[
            { group: 'Espace de travail', items: [
              { label: 'Général',         icon: 'settings' },
              { label: 'Utilisateurs',    icon: 'users',   active: true, count: 42 },
              { label: 'Rôles & permissions', icon: 'lock' },
              { label: 'Espaces',         icon: 'folder' },
              { label: 'Intégrations',    icon: 'plus',    count: 8 },
            ]},
            { group: 'Sécurité', items: [
              { label: 'Authentification',  icon: 'lock' },
              { label: 'SSO / SAML',        icon: 'lock' },
              { label: 'Audit logs',        icon: 'eye' },
              { label: 'Sessions actives',  icon: 'clock' },
            ]},
            { group: 'Facturation', items: [
              { label: 'Abonnement',        icon: 'star' },
              { label: 'Factures',          icon: 'file' },
              { label: 'Méthode de paiement', icon: 'mail' },
            ]},
          ].map(g => (
            <div key={g.group} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px', marginBottom: 6, fontFamily: 'JetBrains Mono, monospace' }}>{g.group}</div>
              {g.items.map(it => (
                <a key={it.label} href="#" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 12px', borderRadius: 6,
                  color: it.active ? P.text : P.mutedSoft,
                  background: it.active ? P.surface2 : 'transparent',
                  textDecoration: 'none', fontSize: 13,
                  fontWeight: it.active ? 500 : 400,
                }}>
                  <Icon name={it.icon} size={15} />
                  <span style={{ flex: 1 }}>{it.label}</span>
                  {it.count != null && <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{it.count}</span>}
                </a>
              ))}
            </div>
          ))}
        </aside>

        {/* ===== MAIN ===== */}
        <div style={{ padding: '24px 32px 48px', overflow: 'auto' }}>

          {/* page header */}
          <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Utilisateurs</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: P.muted }}>42 membres · 38 actifs · 1 désactivé · plan <b style={{ color: P.text }}>Business</b></p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: P.surface, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="download" size={14} /> Export CSV
              </button>
              <button style={{ background: P.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="plus" size={14} color="#fff" /> Inviter un utilisateur
              </button>
            </div>
          </header>

          {/* stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total',         value: '42', sub: '+3 ce mois' },
              { label: 'Actifs 7 j',    value: '38', sub: '90 % du parc' },
              { label: '2FA activé',    value: '34', sub: '81 %' },
              { label: 'Espace utilisé', value: '124 Go', sub: 'sur 500 Go' },
            ].map(s => (
              <div key={s.label} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontSize: 10, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.025em', color: P.text }}>{s.value}</div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* table toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, padding: '7px 12px', flex: 1, maxWidth: 320 }}>
              <Icon name="search" size={14} color={P.muted} />
              <input placeholder="Rechercher un utilisateur…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: P.text, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <button style={{ background: P.surface, color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Rôle · tous <Icon name="chevDown" size={12} />
            </button>
            <button style={{ background: P.surface, color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Statut · tous <Icon name="chevDown" size={12} />
            </button>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>10 sur 42</span>
          </div>

          {/* table */}
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '32px 2.5fr 1fr 1fr 1fr 0.7fr 40px',
              padding: '10px 18px', borderBottom: `1px solid ${P.border}`,
              fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <span></span><span>Utilisateur</span><span>Rôle</span><span>Équipe</span><span>Dernier accès</span><span>2FA</span><span></span>
            </div>
            {users.map((u, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '32px 2.5fr 1fr 1fr 1fr 0.7fr 40px',
                alignItems: 'center', padding: '12px 18px',
                borderBottom: i < users.length - 1 ? `1px solid ${P.borderSubtle}` : 'none',
                fontSize: 13,
                opacity: u.role === 'Désactivé' ? 0.5 : 1,
              }}>
                <span style={{ width: 14, height: 14, borderRadius: 4, border: `1.5px solid ${P.border}`, background: 'transparent' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar name={u.name} size={32} presence={u.presence} ring={P.surface} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: roleColors[u.role], background: u.role === 'Admin' ? P.accentSoft : 'transparent', padding: '3px 9px', borderRadius: 99, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', justifySelf: 'start', fontWeight: 500 }}>{u.role}</span>
                <span style={{ fontSize: 12, color: P.mutedSoft }}>{u.badge}</span>
                <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{u.last}</span>
                <span style={{
                  fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase',
                  color: u.twoFa ? P.green : P.muted,
                  background: u.twoFa ? P.greenSoft : 'transparent',
                  padding: '2px 7px', borderRadius: 4, justifySelf: 'start',
                }}>{u.twoFa ? '✓ on' : 'off'}</span>
                <button style={{ background: 'transparent', border: 'none', color: P.muted, cursor: 'pointer', padding: 4 }}><Icon name="moreH" size={14} /></button>
              </div>
            ))}
          </div>

          {/* recent audit logs */}
          <h2 style={{ margin: '36px 0 16px', fontSize: 14, fontWeight: 600 }}>Activité récente — audit log</h2>
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, overflow: 'hidden' }}>
            {[
              { who: 'Mohamed Doumbia', action: 'a invité',                       target: 'kpetit@externe.com', level: 'info',    when: 'il y a 12 min', ip: '102.176.21.4' },
              { who: 'Issa Koné',       action: 'a modifié le rôle',              target: 'Mlle Yéo · Membre → Admin', level: 'warn', when: '1 h',            ip: '102.176.21.7' },
              { who: 'Système',         action: 'tentative de connexion échouée', target: 'awa.bocoum@a-credi.com (×3)', level: 'error', when: '3 h',         ip: '195.24.55.91' },
              { who: 'Yann Hallage',    action: 'a activé 2FA',                   target: 'sur son compte',     level: 'info',    when: 'hier',           ip: '102.176.21.5' },
              { who: 'Mohamed Doumbia', action: 'a exporté',                      target: '42 utilisateurs (CSV)', level: 'info', when: 'il y a 2 j',      ip: '102.176.21.4' },
            ].map((l, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 140px 130px',
                alignItems: 'center', padding: '12px 18px', gap: 16,
                borderBottom: i < 4 ? `1px solid ${P.borderSubtle}` : 'none', fontSize: 12,
              }}>
                <span style={{
                  fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: { info: P.accentSoft, warn: P.amberSoft, error: P.redSoft }[l.level],
                  color:      { info: P.accent,     warn: P.amber,     error: P.red     }[l.level],
                  padding: '2px 6px', borderRadius: 4, textAlign: 'center', fontWeight: 600,
                }}>{l.level}</span>
                <div>
                  <b style={{ fontWeight: 500, color: P.text }}>{l.who}</b>
                  <span style={{ color: P.muted }}> {l.action} </span>
                  <span style={{ color: P.text }}>{l.target}</span>
                </div>
                <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{l.ip}</span>
                <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>{l.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

window.ScreenAdmin = ScreenAdmin;
