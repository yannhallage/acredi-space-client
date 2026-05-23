// ÉCRAN 08 — Profil utilisateur
// Header avec photo + nom + statut, sections : équipes, activité, paramètres rapides.

function ScreenProfile() {
  const { dark } = useTheme();
  const P = getPalette(dark);

  return (
    <AppShell active="settings" topbarBreadcrumb="PARAMÈTRES / PROFIL" topbarTitle="Mon profil" hideSearch>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* ===== HERO ===== */}
        <div style={{
          background: P.surface, border: `1px solid ${P.border}`, borderRadius: 16,
          padding: 32, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 28,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative honeycomb */}
          <svg viewBox="0 0 600 200" style={{ position: 'absolute', right: 0, top: 0, width: 360, height: '100%', opacity: dark ? 0.06 : 0.05 }} aria-hidden="true">
            <defs>
              <symbol id="pcube" viewBox="0 0 64 64">
                <polygon fill={P.markTop} points="32,6 54.5,19 32,32 9.5,19" />
                <polygon fill={P.markLeft} points="9.5,19 32,32 32,58 9.5,45" />
                <polygon fill={P.markRight} points="54.5,19 54.5,45 32,58 32,32" />
              </symbol>
            </defs>
            {[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(c => (
              <use key={`${r}-${c}`} href="#pcube" x={c * 110 + (r % 2 ? 55 : 0) + 200} y={r * 90 - 40} width="120" height="120" />
            )))}
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Avatar name="Mohamed Doumbia" size={120} presence="online" ring={P.surface} />
          </div>

          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>Direction · AcRēDi Group</div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em' }}>Mohamed Doumbia</h1>
            <p style={{ margin: '6px 0 16px', fontSize: 14, color: P.muted }}>Directeur Général · Abidjan, Côte d'Ivoire · membre depuis mars 2024</p>

            {/* status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: P.bg, border: `1px solid ${P.border}`, borderRadius: 99,
              padding: '6px 6px 6px 12px', cursor: 'pointer',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: P.green }} />
              <span style={{ fontSize: 12, color: P.text }}>Disponible</span>
              <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>· jusqu'à 17:00</span>
              <span style={{ background: P.surface2, borderRadius: 99, padding: '3px 7px', fontSize: 10, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>Modifier</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', zIndex: 1 }}>
            <button style={{ background: P.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="message" size={14} color="#fff" /> Message
            </button>
            <button style={{ background: P.surface2, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, padding: '9px 16px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="video" size={14} /> Appeler
            </button>
          </div>
        </div>

        {/* ===== 2-col grid ===== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>

          {/* LEFT — main */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Informations */}
            <section style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>Informations</h3>
              {[
                ['E-mail',     'mohamed.doumbia@a-credi.com', 'mail'],
                ['Téléphone',  '+225 07 08 12 34 56',         'phoneOff'],
                ['Fuseau',     'Abidjan · GMT+0 · 09:42',     'clock'],
                ['Langue',     'Français',                    'message'],
              ].map(([label, value, ico]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: `1px solid ${P.borderSubtle}` }}>
                  <Icon name={ico} size={16} color={P.muted} />
                  <span style={{ fontSize: 12, color: P.muted, width: 90 }}>{label}</span>
                  <span style={{ flex: 1, fontSize: 13, color: P.text }}>{value}</span>
                  <button style={{ background: 'transparent', color: P.muted, border: 'none', cursor: 'pointer', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>Modifier</button>
                </div>
              ))}
            </section>

            {/* Équipes */}
            <section style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 24 }}>
              <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Mes équipes</h3>
                <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>4 équipes</span>
              </header>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { name: 'Direction',       members: 4,  role: 'Admin',  color: P.accent },
                  { name: 'Produit',         members: 8,  role: 'Membre', color: P.accent2 },
                  { name: 'Commercial',      members: 12, role: 'Membre', color: P.green },
                  { name: 'Design Studio',   members: 6,  role: 'Membre', color: P.amber },
                ].map(t => (
                  <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: P.bg, borderRadius: 8 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 6, background: `${t.color}22`, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                      <Icon name="users" size={16} />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: P.text }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{t.members} membres</div>
                    </div>
                    <span style={{ fontSize: 11, color: t.role === 'Admin' ? P.accent : P.muted, background: t.role === 'Admin' ? P.accentSoft : 'transparent', padding: '3px 8px', borderRadius: 99, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>{t.role}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Activité */}
            <section style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 600 }}>Activité récente</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { what: 'a rejoint la réunion', target: 'Daily Direction', when: 'il y a 12 min' },
                  { what: 'a partagé',           target: 'Brief identité v0.1.pdf', when: '34 min' },
                  { what: 'a commenté',          target: '#design-acredi · "Top, on acte la piste 3."', when: '1 h' },
                  { what: 'a invité',            target: 'Aïcha Bamba dans #design-acredi', when: '3 h' },
                  { what: 'a terminé',           target: 'Sprint #18 · review login', when: 'hier' },
                ].map((a, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 8, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: 8, width: 5, height: 5, borderRadius: 99, background: P.accent }} />
                    <span style={{ fontSize: 13, color: P.text, flex: 1 }}>
                      <span style={{ color: P.muted }}>{a.what}</span> {a.target}
                    </span>
                    <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{a.when}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* RIGHT — quick panels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Statut personnalisé */}
            <section style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600 }}>Mon statut</h3>
              {[
                { label: 'Disponible',         dot: P.green,  active: true },
                { label: 'Occupé',             dot: P.amber },
                { label: 'Ne pas déranger',    dot: P.red },
                { label: 'Hors ligne',         dot: P.slate },
              ].map(s => (
                <button key={s.label} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', background: s.active ? P.surface2 : 'transparent',
                  border: 'none', borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                  color: P.text, fontFamily: 'inherit', fontSize: 13,
                }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: s.dot }} />
                  {s.label}
                  {s.active && <Icon name="chevRight" size={12} color={P.muted} style={{ marginLeft: 'auto', transform: 'rotate(90deg)' }} />}
                </button>
              ))}
              <div style={{
                background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8,
                padding: '10px 12px', marginTop: 12,
                fontSize: 12, color: P.text,
              }}>
                <div style={{ fontSize: 10, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Message</div>
                💼 En revue design Acredi Space
              </div>
            </section>

            {/* Préférences */}
            <section style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600 }}>Préférences</h3>
              {[
                { label: 'Mode sombre',              on: dark },
                { label: 'Notifications bureau',     on: true },
                { label: 'Notifications mobiles',    on: true },
                { label: 'Sons',                     on: false },
                { label: 'Caméra par défaut allumée', on: false },
              ].map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${P.borderSubtle}` }}>
                  <span style={{ fontSize: 13, color: P.text }}>{p.label}</span>
                  <span style={{
                    width: 32, height: 18, borderRadius: 99, position: 'relative',
                    background: p.on ? P.accent : P.surface3, transition: 'background .15s',
                  }}>
                    <span style={{
                      position: 'absolute', top: 2, left: p.on ? 16 : 2,
                      width: 14, height: 14, borderRadius: 99, background: '#fff',
                      transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </span>
                </div>
              ))}
            </section>

            {/* Compte */}
            <section style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600 }}>Compte</h3>
              {[
                ['Sécurité',           'lock'],
                ['Sessions actives',   'eye'],
                ['Données & exports',  'download'],
                ['Aide & support',     'mail'],
              ].map(([label, ico]) => (
                <a key={label} href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', textDecoration: 'none', color: P.text, borderBottom: `1px solid ${P.borderSubtle}`, fontSize: 13 }}>
                  <Icon name={ico} size={15} color={P.muted} />
                  <span style={{ flex: 1 }}>{label}</span>
                  <Icon name="chevRight" size={14} color={P.muted} />
                </a>
              ))}
              <button style={{ width: '100%', marginTop: 14, background: 'transparent', color: P.red, border: `1px solid ${P.red}`, borderRadius: 8, padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Se déconnecter</button>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

window.ScreenProfile = ScreenProfile;
