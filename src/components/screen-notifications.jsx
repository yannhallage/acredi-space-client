// ÉCRAN 10 — Centre de notifications
// Liste groupée par type/temps, marquer comme lu, accès rapide source.

function ScreenNotifications() {
  const { dark } = useTheme();
  const P = getPalette(dark);

  const typeColors = {
    mention:    { c: P.accent,  bg: P.accentSoft,  ico: 'message',  label: 'mention' },
    meeting:    { c: P.accent2, bg: P.accent2Soft, ico: 'video',    label: 'réunion' },
    file:       { c: P.green,   bg: P.greenSoft,   ico: 'file',     label: 'fichier' },
    request:    { c: P.amber,   bg: P.amberSoft,   ico: 'users',    label: 'demande' },
    system:     { c: P.muted,   bg: 'transparent', ico: 'settings', label: 'système' },
    security:   { c: P.red,     bg: P.redSoft,     ico: 'lock',     label: 'sécurité' },
  };

  const groups = [
    { label: 'Nouvelles', items: [
      { type: 'mention',  who: 'Yann Hallage',   action: 'vous a mentionné dans',     where: '#design-acredi',         excerpt: '« @Mohamed Doumbia oui, on garde 5B6CFF, on testera 4F5AFF si besoin… »', when: 'il y a 4 min',   unread: true },
      { type: 'meeting',  who: 'Issa Koné',      action: 'vous invite à',             where: 'Revue design Acredi Space', excerpt: 'Aujourd\'hui à 14:00 · 1h · 4 participants',                                  when: 'il y a 12 min',  unread: true, actions: ['Accepter', 'Refuser'] },
      { type: 'file',     who: 'Aïcha Bamba',    action: 'a partagé',                  where: 'piste-3-aperçu.fig',     excerpt: '14 Mo · accès en lecture · dans 01—Identité visuelle',                       when: 'il y a 28 min',  unread: true },
      { type: 'request',  who: 'Adjoua Konan',   action: 'demande à rejoindre',        where: 'Acredi Space',           excerpt: 'adjoua.konan@externe.com · approbation requise',                              when: '47 min',         unread: true, actions: ['Approuver', 'Refuser'] },
      { type: 'mention',  who: 'Mlle Yéo',       action: 'a réagi à votre message',    where: '#sprint-18',             excerpt: '👍 « OK on acte la piste 3. »',                                              when: '1 h',            unread: true },
    ]},
    { label: 'Aujourd\'hui', items: [
      { type: 'meeting',  who: 'Système',        action: 'rappel',                     where: 'Daily Direction',        excerpt: 'Commence dans 12 min · 4 participants',                                       when: '10:18' },
      { type: 'security', who: 'Système',        action: 'Connexion depuis un nouvel appareil', where: 'MacBook Pro · Abidjan', excerpt: 'IP 102.176.21.4 · Si ce n\'est pas vous, sécurisez votre compte', when: '09:02', actions: ['C\'était moi', 'Sécuriser'] },
      { type: 'file',     who: 'Yann Hallage',   action: 'a commenté',                 where: 'Brief identité v0.1.pdf', excerpt: '« Petite typo page 4, à corriger avant l\'envoi à la Direction. »',          when: '08:47' },
      { type: 'system',   who: 'Acredi Space',   action: 'Mise à jour disponible',     where: 'v1.4.2',                 excerpt: 'Nouvelles fonctionnalités : recherche unifiée, salles persistantes',          when: '07:30' },
    ]},
    { label: 'Cette semaine', items: [
      { type: 'mention',  who: 'Issa Koné',      action: 'vous a mentionné dans',     where: '#design-acredi',         excerpt: '« @Mohamed Doumbia de mon côté c\'est validé. Le bi-ton tient même à 16px. »', when: 'hier' },
      { type: 'meeting',  who: 'Système',        action: 'compte-rendu disponible',    where: 'Comité direction 18 mai', excerpt: '32 min · 6 participants · transcription complète',                            when: 'lun.' },
      { type: 'file',     who: 'Kouadio Yao',    action: 'a téléchargé',               where: 'Audit performance.pdf',  excerpt: '3.2 Mo · vu pour la première fois',                                          when: 'lun.' },
    ]},
  ];

  const NotifRow = ({ n }) => {
    const t = typeColors[n.type];
    return (
      <div style={{
        display: 'flex', gap: 14, padding: '14px 20px',
        background: n.unread ? P.accentSoft : 'transparent',
        position: 'relative', cursor: 'pointer',
      }}>
        {n.unread && <span style={{ position: 'absolute', left: 9, top: 22, width: 6, height: 6, borderRadius: 99, background: P.accent }} />}

        <div style={{ position: 'relative', flex: 'none' }}>
          {n.who === 'Système' || n.who === 'Acredi Space' ? (
            <span style={{
              width: 36, height: 36, borderRadius: 8,
              background: t.bg, color: t.c,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={t.ico} size={16} />
            </span>
          ) : (
            <Avatar name={n.who} size={36} ring={P.bg} />
          )}
          <span style={{
            position: 'absolute', right: -4, bottom: -4,
            width: 18, height: 18, borderRadius: 99,
            background: t.c, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 0 2px ${n.unread ? P.surface : P.bg}`,
          }}>
            <Icon name={t.ico} size={9} color="#fff" />
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: P.text, marginBottom: 4 }}>
            <b style={{ fontWeight: 500 }}>{n.who}</b>
            <span style={{ color: P.muted }}> {n.action} </span>
            <b style={{ fontWeight: 500, color: P.accent }}>{n.where}</b>
          </div>
          <div style={{ fontSize: 12, color: P.mutedSoft, lineHeight: 1.5, marginBottom: n.actions ? 10 : 0 }}>{n.excerpt}</div>
          {n.actions && (
            <div style={{ display: 'flex', gap: 8 }}>
              {n.actions.map((a, j) => (
                <button key={j} style={{
                  background: j === 0 ? P.accent : 'transparent',
                  color: j === 0 ? '#fff' : P.text,
                  border: j === 0 ? 'none' : `1px solid ${P.border}`,
                  borderRadius: 6, padding: '5px 11px',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>{a}</button>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flex: 'none' }}>
          <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>{n.when}</span>
          <button style={{ background: 'transparent', border: 'none', color: P.muted, cursor: 'pointer', padding: 2 }}><Icon name="moreH" size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <AppShell active="notifications" hideSearch>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', height: '100%' }}>

        {/* ===== MAIN ===== */}
        <div style={{ overflow: 'auto' }}>

          {/* header */}
          <header style={{ padding: '28px 32px 18px', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>Notifications</h1>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: P.muted }}>5 nouvelles · 24 cette semaine</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ background: 'transparent', color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, padding: '7px 13px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Tout marquer comme lu</button>
                <button style={{ background: P.surface, color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex' }}>
                  <Icon name="settings" size={15} />
                </button>
              </div>
            </div>

            {/* tabs */}
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { label: 'Tout',         count: 24, active: true },
                { label: 'Mentions',     count: 8 },
                { label: 'Réunions',     count: 5 },
                { label: 'Fichiers',     count: 7 },
                { label: 'Demandes',     count: 2 },
              ].map((t, i) => (
                <a key={t.label} href="#" style={{
                  fontSize: 13, color: t.active ? P.text : P.muted,
                  textDecoration: 'none', paddingBottom: 12,
                  borderBottom: t.active ? `2px solid ${P.accent}` : '2px solid transparent',
                  marginBottom: -1, fontWeight: t.active ? 500 : 400,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {t.label}
                  <span style={{ fontSize: 10, color: P.muted, fontFamily: 'JetBrains Mono, monospace', background: P.surface, padding: '1px 6px', borderRadius: 99 }}>{t.count}</span>
                </a>
              ))}
            </div>
          </header>

          {/* groups */}
          {groups.map(g => (
            <section key={g.label}>
              <div style={{
                padding: '16px 32px 8px', fontSize: 11, color: P.muted,
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase',
                position: 'sticky', top: 0, background: P.bg, zIndex: 1,
                borderBottom: `1px solid ${P.borderSubtle}`,
              }}>{g.label} · <span style={{ color: P.mutedSoft }}>{g.items.length}</span></div>
              {g.items.map((n, i) => (
                <div key={i}>
                  <NotifRow n={n} />
                  {i < g.items.length - 1 && <div style={{ borderBottom: `1px solid ${P.borderSubtle}`, marginLeft: 70 }} />}
                </div>
              ))}
            </section>
          ))}

          <div style={{ padding: '28px 32px', textAlign: 'center' }}>
            <button style={{ background: 'transparent', color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: '8px 16px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer' }}>Voir l'historique complet</button>
          </div>
        </div>

        {/* ===== RIGHT — preferences quick panel ===== */}
        <aside style={{ borderLeft: `1px solid ${P.border}`, padding: 24, overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 600 }}>Préférences rapides</h3>

          {[
            { label: 'Mentions @',           on: true },
            { label: 'Réunions à venir',     on: true },
            { label: 'Nouveaux fichiers',    on: true },
            { label: 'Demandes d\'accès',    on: true },
            { label: 'Alertes sécurité',     on: true },
            { label: 'Mises à jour produit', on: false },
            { label: 'Marketing',            on: false },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${P.borderSubtle}` }}>
              <span style={{ fontSize: 12, color: P.text }}>{p.label}</span>
              <span style={{
                width: 30, height: 17, borderRadius: 99, position: 'relative',
                background: p.on ? P.accent : P.surface3,
              }}>
                <span style={{
                  position: 'absolute', top: 2, left: p.on ? 15 : 2,
                  width: 13, height: 13, borderRadius: 99, background: '#fff',
                }} />
              </span>
            </div>
          ))}

          <h3 style={{ margin: '28px 0 12px', fontSize: 13, fontWeight: 600 }}>Mode "ne pas déranger"</h3>
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: P.muted }} />
              <span style={{ fontSize: 12, color: P.text, fontWeight: 500 }}>Désactivé</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['30 min', '1 h', '2 h', 'Jusqu\'à demain', 'Toute la semaine'].map(t => (
                <button key={t} style={{
                  background: 'transparent', color: P.text,
                  border: `1px solid ${P.border}`, borderRadius: 99,
                  padding: '4px 10px', fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
          </div>

          <h3 style={{ margin: '28px 0 12px', fontSize: 13, fontWeight: 600 }}>Canaux</h3>
          {[
            ['Bureau (Web)',  true],
            ['Bureau (App)',  true],
            ['Mobile (iOS)',  true],
            ['E-mail',        false],
            ['SMS',           false],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: 12 }}>
              <span style={{ color: P.text }}>{k}</span>
              <span style={{ color: v ? P.green : P.muted, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.04em' }}>{v ? '● ON' : '○ OFF'}</span>
            </div>
          ))}
        </aside>
      </div>
    </AppShell>
  );
}

window.ScreenNotifications = ScreenNotifications;
