// ÉCRAN 3 — Chat / Canal d'équipe
// Layout 3 colonnes : channels | thread | details.

function ScreenChat() {
  const { dark } = useTheme();
  const P = getPalette(dark);
  const chatPalette = {
    bg: P.bg,
    surface: P.surface,
    surface2: P.surface2,
    border: P.border,
    text: P.text,
    muted: P.muted,
    mutedSoft: P.mutedSoft,
    accent: P.accent,
    accent2: P.accent2,
  };

  const channels = [
    { name: 'général',         unread: 0,  active: false, icon: 'hash' },
    { name: 'design-acredi',   unread: 3,  active: true,  icon: 'hash' },
    { name: 'sprint-18',       unread: 0,  active: false, icon: 'hash' },
    { name: 'incidents-prod',  unread: 1,  active: false, icon: 'hash', urgent: true },
    { name: 'random',          unread: 0,  active: false, icon: 'hash' },
  ];
  const dms = [
    { name: 'Yann Hallage',  presence: 'online', unread: 2 },
    { name: 'Issa Koné',     presence: 'online' },
    { name: 'Mlle Yéo',      presence: 'dnd' },
    { name: 'Aïcha Bamba',   presence: 'online' },
    { name: 'Kouadio Yao',   presence: 'offline' },
  ];

  const messages = [
    { who: 'Yann Hallage', when: '09:14', content: 'Petite question avant le daily : on bloque la piste 3 pour le logo ? Issa a parlé du polygone hier soir, je suis aussi convaincu.', mine: false },
    { who: 'Issa Koné', when: '09:16', content: 'De mon côté c\'est validé. Le bi-ton sur le hex tient même à 16px, c\'est ce qui m\'a achevé.', mine: false, reactions: [{ e: '✓', n: 3 }, { e: '🔥', n: 2 }] },
    { who: 'Mohamed Doumbia', when: '09:18', content: 'OK on acte la piste 3. Yann, tu prépares les exports SVG ce matin ? Je lance Mlle Yéo sur les tokens design dès cet aprem.', mine: true, reactions: [{ e: '👍', n: 4 }] },
    { who: 'Yann Hallage', when: '09:20', content: 'Reçu. Je dépose une archive `logo-piste-3-v1.zip` dans le canal d\'ici midi. Format SVG propre + 3 variantes app icon en PNG transparent.', mine: false, attachment: { name: 'piste-3-aperçu.fig', size: '14 Mo', ext: 'fig' } },
    { who: 'Mlle Yéo', when: '09:23', content: 'Parfait. Je serai bonne pour intégrer les tokens dans le repo Angular en début d\'aprem. Petit point : on garde `5B6CFF` ou on teste `4F5AFF` comme suggéré en review ?', mine: false },
  ];

  const MessageBubble = ({ m }) => (
    <div style={{ display: 'flex', gap: 12, padding: '6px 0' }}>
      <Avatar name={m.who} size={32} ring={chatPalette.bg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: m.mine ? chatPalette.accent : chatPalette.text }}>{m.who}</span>
          <span style={{ fontSize: 11, color: chatPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>{m.when}</span>
        </div>
        <div style={{
          fontSize: 14, lineHeight: 1.55, color: chatPalette.text,
          background: chatPalette.surface, borderRadius: 10,
          padding: '10px 14px', display: 'inline-block', maxWidth: '90%',
          letterSpacing: '-0.005em',
        }}>
          {m.content}
        </div>
        {m.attachment && (
          <div style={{
            marginTop: 8, padding: '10px 14px',
            background: chatPalette.surface, border: `1px solid ${chatPalette.border}`,
            borderRadius: 10,
            display: 'inline-flex', alignItems: 'center', gap: 12, maxWidth: 360,
          }}>
            <span style={{
              width: 34, height: 34, borderRadius: 6,
              background: 'rgba(139,127,255,0.15)', color: chatPalette.accent2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
            }}>{m.attachment.ext}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: chatPalette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.attachment.name}</div>
              <div style={{ fontSize: 11, color: chatPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>{m.attachment.size}</div>
            </div>
            <button style={{ background: 'transparent', border: 'none', color: chatPalette.muted, padding: 4, cursor: 'pointer' }}>
              <Icon name="download" size={16} />
            </button>
          </div>
        )}
        {m.reactions && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {m.reactions.map((r, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: 99,
                background: chatPalette.surface, border: `1px solid ${chatPalette.border}`,
                fontSize: 11, color: chatPalette.mutedSoft, fontFamily: 'JetBrains Mono, monospace',
              }}>
                <span style={{ fontSize: 12 }}>{r.e}</span>{r.n}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      background: chatPalette.bg, color: chatPalette.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'grid', gridTemplateColumns: '260px 1fr 300px',
      letterSpacing: '-0.01em',
      ['--bg']: chatPalette.bg,
    }}>
      {/* ===== COL 1 — channels ===== */}
      <aside style={{
        background: chatPalette.bg, borderRight: `1px solid ${chatPalette.border}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <AcrediLockup size={22} fontSize={16} />
          <button style={{ background: 'transparent', border: 'none', color: chatPalette.muted, padding: 4, cursor: 'pointer' }}>
            <Icon name="pin" size={15} />
          </button>
        </div>

        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: chatPalette.surface, border: `1px solid ${chatPalette.border}`,
            borderRadius: 8, padding: '7px 12px',
          }}>
            <Icon name="search" size={14} color={chatPalette.muted} />
            <input placeholder="Rechercher…" style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: chatPalette.text, fontSize: 12, fontFamily: 'inherit',
            }} />
          </div>
        </div>

        <div style={{ overflow: 'auto', flex: 1, padding: '0 8px 16px' }}>
          {/* CANAUX */}
          <div style={{ padding: '8px 8px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: chatPalette.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Canaux</span>
            <Icon name="plus" size={12} color={chatPalette.muted} />
          </div>
          {channels.map(c => (
            <a key={c.name} href="#" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 12px', borderRadius: 6,
              color: c.active ? chatPalette.text : chatPalette.mutedSoft,
              background: c.active ? chatPalette.surface2 : 'transparent',
              textDecoration: 'none', fontSize: 13,
              fontWeight: c.active || c.unread > 0 ? 500 : 400,
            }}>
              <Icon name="hash" size={14} color={c.active ? chatPalette.text : chatPalette.muted} />
              <span style={{ flex: 1 }}>{c.name}</span>
              {c.unread > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  padding: '1px 6px', borderRadius: 99,
                  background: c.urgent ? '#EF4444' : chatPalette.accent,
                  color: '#fff', fontFamily: 'JetBrains Mono, monospace',
                }}>{c.unread}</span>
              )}
            </a>
          ))}

          {/* DM */}
          <div style={{ padding: '16px 8px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: chatPalette.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Messages directs</span>
            <Icon name="plus" size={12} color={chatPalette.muted} />
          </div>
          {dms.map(d => (
            <a key={d.name} href="#" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 12px', borderRadius: 6,
              color: chatPalette.mutedSoft,
              textDecoration: 'none', fontSize: 13,
              fontWeight: d.unread ? 500 : 400,
            }}>
              <Avatar name={d.name} size={20} presence={d.presence} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
              {d.unread && (
                <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 99, background: chatPalette.accent, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{d.unread}</span>
              )}
            </a>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${chatPalette.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name="Mohamed Doumbia" size={28} presence="online" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500 }}>Mohamed Doumbia</div>
            <div style={{ fontSize: 10, color: chatPalette.muted }}>Disponible</div>
          </div>
        </div>
      </aside>

      {/* ===== COL 2 — message thread ===== */}
      <section style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 64, padding: '0 24px',
          borderBottom: `1px solid ${chatPalette.border}`,
          display: 'flex', alignItems: 'center', gap: 16,
          flex: 'none',
        }}>
          <Icon name="hash" size={18} color={chatPalette.muted} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em' }}>design-acredi</div>
            <div style={{ fontSize: 11, color: chatPalette.muted, marginTop: 2 }}>Identité visuelle, exports, design system · 8 membres</div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: chatPalette.muted, padding: 6, cursor: 'pointer', borderRadius: 6 }}>
            <Icon name="video" size={16} />
          </button>
          <button style={{ background: 'transparent', border: 'none', color: chatPalette.muted, padding: 6, cursor: 'pointer', borderRadius: 6 }}>
            <Icon name="search" size={16} />
          </button>
          <button style={{ background: 'transparent', border: 'none', color: chatPalette.muted, padding: 6, cursor: 'pointer', borderRadius: 6 }}>
            <Icon name="moreH" size={16} />
          </button>
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px 24px 8px' }}>
          {/* date separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '0 0 16px' }}>
            <span style={{ flex: 1, height: 1, background: chatPalette.border }} />
            <span style={{ fontSize: 11, color: chatPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>JEUDI 21 MAI</span>
            <span style={{ flex: 1, height: 1, background: chatPalette.border }} />
          </div>

          {messages.map((m, i) => <MessageBubble key={i} m={m} />)}

          {/* typing indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0 6px', fontSize: 11, color: chatPalette.muted, fontStyle: 'italic' }}>
            <div style={{ display: 'inline-flex', gap: 3 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 5, height: 5, borderRadius: 99, background: chatPalette.muted,
                  opacity: 0.7,
                }} />
              ))}
            </div>
            Yann Hallage est en train d'écrire…
          </div>
        </div>

        {/* composer */}
        <div style={{ padding: '12px 24px 20px', borderTop: `1px solid ${chatPalette.border}` }}>
          <div style={{
            background: chatPalette.surface, border: `1px solid ${chatPalette.border}`,
            borderRadius: 12, padding: '12px 14px',
          }}>
            <div contentEditable suppressContentEditableWarning style={{
              outline: 'none', minHeight: 24, fontSize: 14, color: chatPalette.text,
              fontFamily: 'inherit', letterSpacing: '-0.005em', lineHeight: 1.5,
            }}>Une mention <span style={{ color: chatPalette.accent }}>@Mlle Yéo</span> : oui, on garde 5B6CFF, on testera 4F5AFF si vraiment besoin après les premiers retours UI.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${chatPalette.border}` }}>
              <button style={{ background: 'transparent', border: 'none', padding: 7, color: chatPalette.muted, cursor: 'pointer', borderRadius: 6 }}>
                <Icon name="paperclip" size={15} />
              </button>
              <button style={{ background: 'transparent', border: 'none', padding: 7, color: chatPalette.muted, cursor: 'pointer', borderRadius: 6 }}>
                <Icon name="smile" size={15} />
              </button>
              <button style={{ background: 'transparent', border: 'none', padding: 7, color: chatPalette.muted, cursor: 'pointer', borderRadius: 6 }}>
                <Icon name="video" size={15} />
              </button>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: chatPalette.muted, fontFamily: 'JetBrains Mono, monospace', marginRight: 8 }}>↵ envoyer</span>
              <button style={{
                background: chatPalette.accent, color: '#fff',
                border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Icon name="send" size={14} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COL 3 — details ===== */}
      <aside style={{
        background: chatPalette.bg, borderLeft: `1px solid ${chatPalette.border}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <header style={{
          height: 64, padding: '0 20px',
          borderBottom: `1px solid ${chatPalette.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flex: 'none',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Détails du canal</span>
          <Icon name="moreH" size={16} color={chatPalette.muted} />
        </header>

        <div style={{ overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: chatPalette.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 }}>À propos</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: chatPalette.mutedSoft }}>
              Canal dédié à l'identité visuelle d'Acredi Space — logo, design system, exports. Pas de discussion produit ici, voir <span style={{ color: chatPalette.accent }}>#sprint-18</span>.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 11, color: chatPalette.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>Membres</span><span>8</span>
            </div>
            {[
              { name: 'Mohamed Doumbia', role: 'Direction', presence: 'online' },
              { name: 'Yann Hallage',    role: 'Produit',    presence: 'online' },
              { name: 'Issa Koné',       role: 'Tech',       presence: 'online' },
              { name: 'Mlle Yéo',        role: 'Dev',        presence: 'dnd' },
              { name: 'Aïcha Bamba',     role: 'Design',     presence: 'online' },
            ].map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                <Avatar name={p.name} size={28} presence={p.presence} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: chatPalette.text }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: chatPalette.muted }}>{p.role}</div>
                </div>
              </div>
            ))}
            <a href="#" style={{ display: 'block', fontSize: 12, color: chatPalette.accent, marginTop: 8, textDecoration: 'none' }}>+ 3 autres membres</a>
          </div>

          <div>
            <div style={{ fontSize: 11, color: chatPalette.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 }}>Fichiers récents</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { name: 'piste-3-aperçu.fig',         size: '14 Mo', ext: 'fig', color: '#8B7FFF' },
                { name: 'brief-identité-v0.1.pdf',    size: '2.4 Mo', ext: 'pdf', color: '#EF4444' },
                { name: 'logo-exports.zip',           size: '486 Ko', ext: 'zip', color: '#71717A' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, background: chatPalette.surface }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: 4,
                    background: `${f.color}22`, color: f.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase', flex: 'none',
                  }}>{f.ext}</span>
                  <span style={{ flex: 1, fontSize: 12, color: chatPalette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <span style={{ fontSize: 10, color: chatPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>{f.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

window.ScreenChat = ScreenChat;
