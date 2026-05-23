// ÉCRAN 05 — Messagerie directe (DM)
// 2 colonnes : liste des conversations 1-to-1 + fil de conversation.
// Inspiration : iMessage / Telegram / Linear DM.

function ScreenDM() {
  const { dark } = useTheme();
  const P = getPalette(dark);

  const conversations = [
    { name: 'Yann Hallage',     presence: 'online',  last: 'Je dépose l\'archive vers midi.',                  when: '09:24', unread: 2, active: true,  pinned: true },
    { name: 'Issa Koné',        presence: 'online',  last: 'Tu as testé le bi-ton sur le splash mobile ?',     when: '09:18', unread: 0, typing: true },
    { name: 'Mlle Yéo',         presence: 'dnd',     last: 'Sprint #18 — review en fin d\'après-midi ?',       when: '09:12', unread: 0 },
    { name: 'Aïcha Bamba',      presence: 'online',  last: 'Tu as un retour sur le mock du calendrier ?',      when: '08:55', unread: 1 },
    { name: 'Kouadio Yao',      presence: 'offline', last: 'OK reçu, je te confirme demain matin.',            when: 'hier',  unread: 0 },
    { name: 'Fatou Diallo',     presence: 'online',  last: 'Tu m\'envoies les visuels du pitch ?',             when: 'hier',  unread: 0 },
    { name: 'Adjoua Konan',     presence: 'offline', last: 'Bonne soirée 👋',                                  when: 'lun.',  unread: 0 },
    { name: 'Ousmane Touré',    presence: 'offline', last: 'Vu, merci !',                                      when: '12 mai', unread: 0 },
  ];

  const thread = [
    { day: 'Hier', items: [
      { who: 'me',           when: '17:42', text: 'Salut Yann, j\'ai vu ton retour sur la piste 3. On bloque dessus ?' },
      { who: 'Yann Hallage', when: '17:51', text: 'Oui c\'est validé de mon côté. Mlle Yéo est aussi convaincue. On lance la production des exports demain matin.' },
      { who: 'Yann Hallage', when: '17:52', text: 'Faut juste valider la permutation des facettes pour la version mobile — sur petits écrans le 5B6CFF à droite est un peu lourd.' },
      { who: 'me',           when: '17:55', text: 'OK, on en reparle demain à 9:30. Je prépare une comparaison.' },
    ]},
    { day: 'Aujourd\'hui', items: [
      { who: 'Yann Hallage', when: '09:18', text: 'Hello, c\'est bon pour 9:30 ? J\'ai aussi 2-3 idées sur l\'animation hover.' },
      { who: 'Yann Hallage', when: '09:18', attachment: { name: 'piste-3-mobile-comparison.png', size: '1.2 Mo', ext: 'png' } },
      { who: 'me',           when: '09:22', text: 'Top, on se cale là-dessus. Je suis dans le bureau dans 10 min.' },
      { who: 'Yann Hallage', when: '09:24', text: 'Je dépose l\'archive vers midi.' },
    ]},
  ];

  const active = conversations.find(c => c.active);

  const Bubble = ({ m }) => {
    const mine = m.who === 'me';
    return (
      <div style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap: 10, marginBottom: 8 }}>
        {!mine && <Avatar name={m.who} size={28} />}
        <div style={{ maxWidth: '64%' }}>
          {m.text && (
            <div style={{
              padding: '10px 14px',
              background: mine ? P.accent : P.surface,
              color: mine ? '#fff' : P.text,
              borderRadius: 16,
              borderTopLeftRadius: mine ? 16 : 4,
              borderTopRightRadius: mine ? 4 : 16,
              fontSize: 14, lineHeight: 1.5, letterSpacing: '-0.005em',
            }}>{m.text}</div>
          )}
          {m.attachment && (
            <div style={{
              padding: '10px 14px',
              background: P.surface, border: `1px solid ${P.border}`,
              borderRadius: 12, marginTop: m.text ? 4 : 0,
              display: 'inline-flex', alignItems: 'center', gap: 12, minWidth: 220,
            }}>
              <span style={{
                width: 36, height: 36, borderRadius: 6,
                background: P.accent2Soft, color: P.accent2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
              }}>{m.attachment.ext}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.attachment.name}</div>
                <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{m.attachment.size}</div>
              </div>
              <Icon name="download" size={15} color={P.muted} />
            </div>
          )}
          <div style={{ fontSize: 10, color: P.muted, fontFamily: 'JetBrains Mono, monospace', marginTop: 4, textAlign: mine ? 'right' : 'left', letterSpacing: '0.04em' }}>{m.when}{mine && ' · vu'}</div>
        </div>
      </div>
    );
  };

  return (
    <AppShell active="chat" hideSearch>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%' }}>

        {/* ===== LEFT — convo list ===== */}
        <aside style={{ borderRight: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em' }}>Messages</h1>
              <button style={{ background: P.accent, color: '#fff', border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', display: 'flex' }}>
                <Icon name="plus" size={14} color="#fff" />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, padding: '8px 12px' }}>
              <Icon name="search" size={14} color={P.muted} />
              <input placeholder="Rechercher une conversation…" style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: P.text, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px' }}>
            {['Toutes', 'Non lues', 'Mentions'].map((t, i) => (
              <button key={t} style={{
                background: i === 0 ? P.surface2 : 'transparent',
                color: i === 0 ? P.text : P.muted,
                border: `1px solid ${i === 0 ? P.border : 'transparent'}`,
                borderRadius: 99, padding: '4px 11px',
                fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 16px' }}>
            {conversations.map((c, i) => (
              <a key={i} href="#" style={{
                display: 'flex', gap: 12, padding: '12px 12px',
                borderRadius: 8, textDecoration: 'none',
                background: c.active ? P.surface2 : 'transparent',
                position: 'relative',
                alignItems: 'center',
              }}>
                <Avatar name={c.name} size={42} presence={c.presence} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: c.unread ? 600 : 500, color: P.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.name}
                      {c.pinned && <Icon name="pin" size={11} color={P.muted} />}
                    </span>
                    <span style={{ fontSize: 11, color: c.unread ? P.accent : P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{c.when}</span>
                  </div>
                  <div style={{ fontSize: 12, color: c.typing ? P.accent : c.unread ? P.text : P.muted, fontStyle: c.typing ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.typing ? 'en train d\'écrire…' : c.last}
                  </div>
                </div>
                {c.unread > 0 && (
                  <span style={{ position: 'absolute', right: 14, bottom: 12, background: P.accent, color: '#fff', fontSize: 10, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', padding: '1px 7px', borderRadius: 99 }}>{c.unread}</span>
                )}
              </a>
            ))}
          </div>
        </aside>

        {/* ===== RIGHT — conversation ===== */}
        <section style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header style={{
            height: 64, padding: '0 24px', borderBottom: `1px solid ${P.border}`,
            display: 'flex', alignItems: 'center', gap: 14, flex: 'none',
          }}>
            <Avatar name={active.name} size={36} presence={active.presence} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em' }}>{active.name}</div>
              <div style={{ fontSize: 11, color: P.green, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em' }}>● Disponible · Directeur produit</div>
            </div>
            <button style={{ background: 'transparent', color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: 8, cursor: 'pointer' }}><Icon name="video" size={15} /></button>
            <button style={{ background: 'transparent', color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: 8, cursor: 'pointer' }}><Icon name="search" size={15} /></button>
            <button style={{ background: 'transparent', color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: 8, cursor: 'pointer' }}><Icon name="moreH" size={15} /></button>
          </header>

          <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
            {thread.map((day, di) => (
              <div key={di}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: di === 0 ? '0 0 16px' : '20px 0 16px' }}>
                  <span style={{ flex: 1, height: 1, background: P.border }} />
                  <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{day.day}</span>
                  <span style={{ flex: 1, height: 1, background: P.border }} />
                </div>
                {day.items.map((m, i) => <Bubble key={i} m={m} />)}
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <Avatar name={active.name} size={28} />
              <div style={{
                padding: '12px 16px', background: P.surface, borderRadius: 16, borderTopLeftRadius: 4,
                display: 'inline-flex', gap: 4,
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: P.muted, animation: `dm-bounce 1.2s ${i * 0.15}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          </div>

          {/* composer */}
          <div style={{ padding: '14px 32px 24px', borderTop: `1px solid ${P.border}` }}>
            <div style={{
              background: P.surface, border: `1px solid ${P.border}`, borderRadius: 24,
              padding: '6px 6px 6px 18px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <button style={{ background: 'transparent', border: 'none', color: P.muted, padding: 6, cursor: 'pointer' }}><Icon name="paperclip" size={16} /></button>
              <input placeholder={`Message à ${active.name}…`} style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: P.text, fontSize: 14, fontFamily: 'inherit', padding: '8px 4px', letterSpacing: '-0.005em',
              }} />
              <button style={{ background: 'transparent', border: 'none', color: P.muted, padding: 6, cursor: 'pointer' }}><Icon name="smile" size={16} /></button>
              <button style={{ background: P.accent, border: 'none', borderRadius: 99, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="send" size={14} color="#fff" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <style>{`@keyframes dm-bounce{0%,80%,100%{opacity:0.4;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>
    </AppShell>
  );
}

window.ScreenDM = ScreenDM;
