// ÉCRAN 1 — Login / Connexion
// Centered card on dark bg. Logo + tagline + email/password + primary CTA.

function ScreenLogin() {
  const { dark } = useTheme();
  const P = getPalette(dark);
  const loginPalette = {
    bg: P.bg,
    surface: P.surface,
    border: P.border,
    muted: P.muted,
    text: P.text,
    accent: P.accent,
  };
  const fieldStyle = {
    width: '100%',
    background: P.surface,
    border: `1px solid ${P.border}`,
    borderRadius: 8,
    padding: '14px 16px',
    color: loginPalette.text,
    fontFamily: 'inherit',
    fontSize: 15,
    letterSpacing: '-0.01em',
    outline: 'none',
  };
  const labelStyle = {
    display: 'block',
    fontSize: 12,
    color: loginPalette.muted,
    marginBottom: 8,
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: loginPalette.bg,
      color: loginPalette.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
      letterSpacing: '-0.01em',
    }}>
      {/* Decorative honeycomb background — extremely subtle */}
      <svg viewBox="0 0 1200 800" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: dark ? 0.04 : 0.06, pointerEvents: 'none',
      }} aria-hidden="true">
        <defs>
          <symbol id="lcube" viewBox="0 0 64 64">
            <polygon fill={P.markTop} points="32,6 54.5,19 32,32 9.5,19" />
            <polygon fill={P.markLeft} points="9.5,19 32,32 32,58 9.5,45" />
            <polygon fill={P.markRight} points="54.5,19 54.5,45 32,58 32,32" />
          </symbol>
        </defs>
        {Array.from({ length: 8 }, (_, row) =>
          Array.from({ length: 12 }, (_, col) => {
            const x = col * 140 + (row % 2 === 0 ? -40 : 30);
            const y = row * 120 - 60;
            return <use key={`${row}-${col}`} href="#lcube" x={x} y={y} width="160" height="160" />;
          })
        )}
      </svg>

      {/* Top brand bar */}
      <header style={{
        position: 'relative', zIndex: 1,
        padding: '32px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <AcrediLockup size={24} fontSize={18} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: loginPalette.muted }}>
          <span>Nouveau ici ?</span>
          <a href="#" style={{ color: loginPalette.text, textDecoration: 'none', fontWeight: 500 }}>Créer un compte →</a>
        </div>
      </header>

      {/* Centered card */}
      <main style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
      }}>
        <div style={{
          width: 420,
          padding: '48px 44px',
          background: dark ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.85)',
          border: `1px solid ${P.border}`,
          borderRadius: 16,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
            <AcrediMark size={48} />
            <h1 style={{
              margin: '24px 0 8px', fontSize: 26, fontWeight: 600,
              letterSpacing: '-0.025em', color: loginPalette.text,
            }}>Connectez-vous</h1>
            <p style={{
              margin: 0, fontSize: 14, color: loginPalette.muted,
              letterSpacing: '-0.01em',
            }}>Your team. One space.</p>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={e => e.preventDefault()}>
            <div>
              <label style={labelStyle}>e-mail</label>
              <input type="email" defaultValue="mohamed.doumbia@a-credi.com" style={fieldStyle} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={labelStyle}>mot de passe</label>
                <a href="#" style={{ fontSize: 11, color: loginPalette.muted, textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>oublié ?</a>
              </div>
              <input type="password" defaultValue="••••••••••••" style={fieldStyle} />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: loginPalette.muted, marginTop: 4, cursor: 'pointer' }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: P.bg, border: `1px solid ${P.border}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={loginPalette.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span>Rester connecté sur cet appareil</span>
            </label>

            <button type="submit" style={{
              marginTop: 8,
              width: '100%',
              padding: '14px 16px',
              background: loginPalette.accent,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Entrer dans l'espace
              <Icon name="arrowRight" size={16} color="#FFFFFF" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
              <span style={{ flex: 1, height: 1, background: P.border }} />
              <span style={{ fontSize: 11, color: loginPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }}>OU</span>
              <span style={{ flex: 1, height: 1, background: P.border }} />
            </div>

            <button type="button" style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              color: loginPalette.text,
              border: `1px solid ${P.border}`,
              borderRadius: 8,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill={P.text} d="M21.35 11.1H12v2.9h5.35c-.24 1.3-1.5 3.83-5.35 3.83-3.22 0-5.85-2.66-5.85-5.93s2.63-5.93 5.85-5.93c1.84 0 3.07.78 3.77 1.46l2.58-2.48C16.85 3.3 14.65 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.55 0 9.22-3.9 9.22-9.4 0-.63-.07-1.1-.16-1.5z"/>
              </svg>
              Continuer avec Google
            </button>
          </form>
        </div>
      </main>

      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '28px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: loginPalette.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
      }}>
        <span>Acredi Space — un produit AcRēDi Group</span>
        <span style={{ display: 'flex', gap: 24 }}>
          <a href="#" style={{ color: loginPalette.muted, textDecoration: 'none' }}>Confidentialité</a>
          <a href="#" style={{ color: loginPalette.muted, textDecoration: 'none' }}>CGU</a>
          <a href="#" style={{ color: loginPalette.muted, textDecoration: 'none' }}>Aide</a>
        </span>
      </footer>
    </div>
  );
}

window.ScreenLogin = ScreenLogin;
