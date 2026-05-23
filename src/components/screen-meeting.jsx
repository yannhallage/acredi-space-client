// ÉCRAN 4 — Salle de réunion vidéo
// Mosaïque 4 tuiles + barre de contrôles + chat latéral pliable.

function ScreenMeeting() {
  const { dark } = useTheme();
  const P = getPalette(dark);
  const mPalette = {
    room: dark ? '#0A0A0F' : '#E4E4E7',
    bg: P.bg,
    surface: P.surface,
    surface2: P.surface2,
    border: P.border,
    text: P.text,
    muted: P.muted,
    mutedSoft: P.mutedSoft,
    accent: P.accent,
    accent2: P.accent2,
    red: P.red,
  };

  // Each tile = a "video feed" placeholder + name plate.
  // We render an abstract gradient + a large avatar centered (camera-off feel for some).
  const tiles = [
    { name: 'Mohamed Doumbia', mic: true,  cam: true,  speaking: true,  bg: 'linear-gradient(135deg,#1d234d 0%,#3B3F8A 100%)', role: 'Vous · hôte' },
    { name: 'Yann Hallage',    mic: true,  cam: true,  speaking: false, bg: 'linear-gradient(135deg,#2d1a30 0%,#7A3B6E 100%)', role: 'Produit' },
    { name: 'Issa Koné',       mic: false, cam: false, speaking: false, bg: 'linear-gradient(135deg,#0F0F12 0%,#1F1F23 100%)', role: 'Tech' },
    { name: 'Mlle Yéo',        mic: true,  cam: true,  speaking: false, bg: 'linear-gradient(135deg,#1a2e25 0%,#2F5E4E 100%)', role: 'Dev', raised: true },
  ];

  const Tile = ({ t }) => (
    <div style={{
      position: 'relative', borderRadius: 14, overflow: 'hidden',
      background: t.bg, border: t.speaking ? `2px solid ${mPalette.accent}` : `2px solid transparent`,
      transition: 'border-color .2s',
      aspectRatio: '16/9',
    }}>
      {/* abstract texture overlay */}
      <svg viewBox="0 0 400 225" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} aria-hidden="true">
        <defs>
          <radialGradient id={`g-${t.name}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="225" fill={`url(#g-${t.name})`} />
      </svg>

      {/* centered avatar or camera-off ghost */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        {t.cam ? (
          <Avatar name={t.name} size={88} />
        ) : (
          <>
            <div style={{
              width: 88, height: 88, borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mPalette.muted, border: `1px solid ${mPalette.border}`,
            }}>
              <Icon name="cameraOff" size={32} color={mPalette.muted} />
            </div>
            <span style={{ fontSize: 11, color: mPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>Caméra désactivée</span>
          </>
        )}
      </div>

      {/* raised hand */}
      {t.raised && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 36, height: 36, borderRadius: 10,
          background: mPalette.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(91,108,255,0.4)',
        }}>
          <Icon name="hand" size={18} color="#fff" />
        </div>
      )}

      {/* name plate */}
      <div style={{
        position: 'absolute', left: 14, bottom: 14,
        background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(8px)',
        borderRadius: 8, padding: '6px 10px',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, color: mPalette.text, fontWeight: 500,
      }}>
        {!t.mic ? (
          <Icon name="micOff" size={13} color={mPalette.red} />
        ) : t.speaking ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {[10, 14, 8, 12].map((h, i) => (
              <span key={i} style={{ width: 2.5, height: h, background: mPalette.accent, borderRadius: 1 }} />
            ))}
          </span>
        ) : (
          <Icon name="mic" size={13} color={mPalette.mutedSoft} />
        )}
        <span>{t.name}</span>
        <span style={{ color: mPalette.mutedSoft, fontWeight: 400, fontSize: 11 }}>· {t.role}</span>
      </div>
    </div>
  );

  // Tiny control button factory
  const Ctl = ({ icon, label, active, danger, color }) => (
    <button style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
    }}>
      <span style={{
        width: 48, height: 48, borderRadius: 12,
        background: danger ? mPalette.red : active ? mPalette.surface2 : 'rgba(255,255,255,0.05)',
        border: `1px solid ${danger ? mPalette.red : mPalette.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: danger ? '#fff' : color || mPalette.text,
        transition: 'background .15s',
      }}>
        <Icon name={icon} size={20} />
      </span>
      <span style={{ fontSize: 10, color: mPalette.mutedSoft, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>{label}</span>
    </button>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      background: mPalette.room, color: mPalette.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'grid', gridTemplateColumns: '1fr 320px', gridTemplateRows: '64px 1fr 112px',
      letterSpacing: '-0.01em',
      ['--bg']: mPalette.room,
    }}>
      {/* ===== TOPBAR ===== */}
      <header style={{
        gridColumn: '1 / -1',
        padding: '0 24px',
        borderBottom: `1px solid ${mPalette.border}`,
        display: 'flex', alignItems: 'center', gap: 20,
        background: mPalette.bg,
      }}>
        <AcrediLockup size={20} fontSize={15} />

        <span style={{ width: 1, height: 24, background: mPalette.border }} />

        <div>
          <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
            Revue design Acredi Space
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(239,68,68,0.12)', color: mPalette.red,
              padding: '2px 9px', borderRadius: 99,
              fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: mPalette.red, animation: 'pulse 1.6s ease-in-out infinite' }} />
              En direct · 14:32
            </span>
          </div>
          <div style={{ fontSize: 11, color: mPalette.muted, marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>4 participants · enregistrement actif</div>
        </div>

        <div style={{ flex: 1 }} />

        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', color: mPalette.mutedSoft,
          border: `1px solid ${mPalette.border}`, borderRadius: 8,
          padding: '7px 12px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
        }}>
          <Icon name="users" size={14} /> Participants <span style={{ color: mPalette.text, fontFamily: 'JetBrains Mono, monospace' }}>4</span>
        </button>

        <button style={{ background: 'transparent', color: mPalette.mutedSoft, border: `1px solid ${mPalette.border}`, borderRadius: 8, padding: 8, cursor: 'pointer' }}>
          <Icon name="settings" size={15} />
        </button>
      </header>

      {/* ===== STAGE — mosaic ===== */}
      <main style={{
        padding: 24,
        background: mPalette.room,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 18, width: '100%', maxWidth: 1000,
        }}>
          {tiles.map(t => <Tile key={t.name} t={t} />)}
        </div>
      </main>

      {/* ===== CHAT PANEL (right) ===== */}
      <aside style={{
        gridRow: '2 / 4',
        background: mPalette.bg,
        borderLeft: `1px solid ${mPalette.border}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <header style={{
          height: 56, padding: '0 18px',
          borderBottom: `1px solid ${mPalette.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flex: 'none',
        }}>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <a href="#" style={{ color: mPalette.text, textDecoration: 'none', borderBottom: `2px solid ${mPalette.accent}`, paddingBottom: 18, marginBottom: -18 }}>Chat</a>
            <a href="#" style={{ color: mPalette.muted, textDecoration: 'none' }}>Notes</a>
          </div>
          <Icon name="chevRight" size={16} color={mPalette.muted} />
        </header>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { who: 'Yann Hallage', when: '14:18', text: 'On peut afficher la piste 3 plein écran ? Je veux montrer les facettes.' },
            { who: 'Mohamed Doumbia', when: '14:21', text: 'C\'est lancé. Issa, tu peux activer ta caméra ?', mine: true },
            { who: 'Issa Koné', when: '14:22', text: 'Ah pardon, problème de webcam ce matin. Je suis là par contre.' },
            { who: 'Mlle Yéo', when: '14:29', text: 'Petite question sur l\'animation hover — on la garde sur le splash mobile aussi ?', raised: true },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <Avatar name={c.who} size={26} ring={mPalette.bg} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.mine ? mPalette.accent : mPalette.text }}>{c.who}</span>
                  <span style={{ fontSize: 10, color: mPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>{c.when}</span>
                  {c.raised && <Icon name="hand" size={11} color={mPalette.accent} />}
                </div>
                <div style={{ fontSize: 13, color: mPalette.mutedSoft, lineHeight: 1.5 }}>{c.text}</div>
              </div>
            </div>
          ))}

          {/* system notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, background: mPalette.surface, fontSize: 11, color: mPalette.muted, fontFamily: 'JetBrains Mono, monospace' }}>
            <Icon name="hand" size={12} color={mPalette.accent} />
            Mlle Yéo a levé la main · 14:29
          </div>
        </div>

        {/* composer */}
        <div style={{ padding: 14, borderTop: `1px solid ${mPalette.border}` }}>
          <div style={{
            background: mPalette.surface, border: `1px solid ${mPalette.border}`,
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <input placeholder="Message à la réunion…" style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: mPalette.text, fontSize: 13, fontFamily: 'inherit',
            }} />
            <button style={{ background: 'transparent', border: 'none', color: mPalette.muted, padding: 4, cursor: 'pointer' }}>
              <Icon name="smile" size={15} />
            </button>
            <button style={{ background: mPalette.accent, border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
              <Icon name="send" size={13} color="#fff" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== CONTROL BAR ===== */}
      <footer style={{
        background: mPalette.bg,
        borderTop: `1px solid ${mPalette.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 14, padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Ctl icon="mic"      label="Micro" />
          <Ctl icon="camera"   label="Caméra" />
          <Ctl icon="screen"   label="Partager" />
          <span style={{ width: 1, height: 36, background: mPalette.border, margin: '0 4px' }} />
          <Ctl icon="message"  label="Chat" active />
          <Ctl icon="hand"     label="Lever main" />
          <Ctl icon="users"    label="Participants" />
          <span style={{ width: 1, height: 36, background: mPalette.border, margin: '0 4px' }} />
          <Ctl icon="phoneOff" label="Raccrocher" danger />
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

window.ScreenMeeting = ScreenMeeting;
