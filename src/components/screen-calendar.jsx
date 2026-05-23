// ÉCRAN 06 — Calendrier
// Vue mois avec événements colorés + panneau jour à droite.

function ScreenCalendar() {
  const { dark } = useTheme();
  const P = getPalette(dark);

  // Mai 2026 — starts on Friday (day 5)
  // Build 6 weeks grid (42 cells) starting from Mon, 27 Apr 2026
  const startDay = -4; // April 27 = grid[0]
  const today = 21;    // 21 May
  const monthLabel = 'mai 2026';
  const weekHeaders = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

  // Events keyed by day-of-month (positive only in May)
  const events = {
    1:  [{ name: 'Brief identité', color: P.accent2, time: '10:00' }],
    4:  [{ name: 'Sprint #18 kickoff', color: P.green, time: '09:00' }],
    5:  [{ name: 'Daily Direction', color: P.accent, time: '10:30' }, { name: 'Sync clients ACME', color: P.green, time: '16:30' }],
    7:  [{ name: 'Revue design', color: P.accent2, time: '14:00' }],
    11: [{ name: 'Soutenance v1', color: P.amber, time: '09:30' }],
    12: [{ name: 'Daily Direction', color: P.accent, time: '10:30' }, { name: '1:1 Yann', color: P.accent2, time: '15:00' }],
    14: [{ name: 'Workshop logo', color: P.accent2, time: '14:00', long: true }],
    18: [{ name: 'Comité direction', color: P.red, time: '10:00' }],
    19: [{ name: 'Daily Direction', color: P.accent, time: '10:30' }],
    20: [{ name: 'Revue design v2', color: P.accent2, time: '14:00' }],
    21: [{ name: 'Daily Direction', color: P.accent, time: '10:30', live: true }, { name: 'Revue design Acredi Space', color: P.accent2, time: '14:00' }, { name: 'Sync clients ACME', color: P.green, time: '16:30' }],
    22: [{ name: 'Atelier UX mobile', color: P.amber, time: '09:00' }],
    25: [{ name: 'Pres. soutenance', color: P.amber, time: '11:00' }],
    26: [{ name: 'Daily Direction', color: P.accent, time: '10:30' }],
    28: [{ name: 'Démo client ACME', color: P.green, time: '15:00' }],
  };

  const todayEvents = events[today] || [];

  return (
    <AppShell active="calendar" hideSearch>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: '100%' }}>
        {/* ===== MAIN CALENDAR ===== */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* header */}
          <header style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>{monthLabel}</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>Semaine 21 · 38 événements ce mois</p>
            </div>
            <div style={{ display: 'flex', gap: 4, marginLeft: 16 }}>
              <button style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}><Icon name="chevRight" size={14} style={{ transform: 'rotate(180deg)' }} /></button>
              <button style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Aujourd'hui</button>
              <button style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.text, borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex' }}><Icon name="chevRight" size={14} /></button>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 4, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, padding: 3 }}>
              {['Mois', 'Semaine', 'Jour', 'Agenda'].map((v, i) => (
                <button key={v} style={{
                  background: i === 0 ? P.surface2 : 'transparent',
                  color: i === 0 ? P.text : P.muted,
                  border: 'none', borderRadius: 6, padding: '5px 12px',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>{v}</button>
              ))}
            </div>
            <button style={{ background: P.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="plus" size={14} color="#fff" /> Créer
            </button>
          </header>

          {/* day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, paddingBottom: 8 }}>
            {weekHeaders.map(d => (
              <div key={d} style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center', padding: 6 }}>{d}</div>
            ))}
          </div>

          {/* month grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', gap: 1, background: P.border, border: `1px solid ${P.border}`, borderRadius: 10, overflow: 'hidden', flex: 1 }}>
            {Array.from({ length: 42 }, (_, i) => {
              const dayNum = i + startDay + 1;
              const inMonth = dayNum >= 1 && dayNum <= 31;
              const display = inMonth ? dayNum : (dayNum <= 0 ? 30 + dayNum : dayNum - 31);
              const isToday = inMonth && dayNum === today;
              const isWeekend = i % 7 >= 5;
              const dayEvents = inMonth ? (events[dayNum] || []) : [];

              return (
                <div key={i} style={{
                  background: P.bg,
                  padding: '6px 8px',
                  minHeight: 0,
                  display: 'flex', flexDirection: 'column', gap: 3,
                  opacity: inMonth ? 1 : 0.4,
                  position: 'relative',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    marginBottom: 2,
                  }}>
                    {isToday ? (
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: P.accent, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600,
                      }}>{display}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: isWeekend ? P.muted : P.text, fontWeight: 500, padding: '0 4px' }}>{display}</span>
                    )}
                  </div>

                  {dayEvents.slice(0, 3).map((ev, j) => (
                    <div key={j} style={{
                      background: `${ev.color}22`,
                      color: ev.color,
                      borderLeft: `3px solid ${ev.color}`,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {ev.live && <span style={{ width: 5, height: 5, borderRadius: 99, background: P.red, flex: 'none' }} />}
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', opacity: 0.7, flex: 'none' }}>{ev.time}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: 10, color: P.muted, padding: '2px 6px', fontFamily: 'JetBrains Mono, monospace' }}>+{dayEvents.length - 3} autres</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== RIGHT — today's events ===== */}
        <aside style={{ borderLeft: `1px solid ${P.border}`, padding: 24, overflow: 'auto' }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>Aujourd'hui · jeudi 21 mai</div>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em' }}>{todayEvents.length} événements</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {todayEvents.map((ev, i) => (
              <div key={i} style={{
                background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10,
                padding: 14, position: 'relative', overflow: 'hidden',
              }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: ev.color }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: P.text, letterSpacing: '-0.01em' }}>{ev.name}</div>
                    <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>{ev.time} → 11:00 · 30 min</div>
                  </div>
                  {ev.live && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: P.redSoft, color: P.red,
                      padding: '2px 8px', borderRadius: 99,
                      fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: 99, background: P.red }} />
                      live
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {['Mohamed Doumbia', 'Yann Hallage', 'Issa Koné'].slice(0, i === 0 ? 3 : 2).map((n, j) => (
                    <span key={n} style={{ marginLeft: j === 0 ? 0 : -8 }}><Avatar name={n} size={22} ring={P.surface} /></span>
                  ))}
                </div>
                {ev.live ? (
                  <button style={{ width: '100%', background: P.accent, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Rejoindre la réunion</button>
                ) : (
                  <button style={{ width: '100%', background: 'transparent', color: P.text, border: `1px solid ${P.border}`, borderRadius: 6, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Voir le détail</button>
                )}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Calendriers</div>
          {[
            { name: 'Mon agenda',     color: P.accent,  active: true },
            { name: 'Équipe Direction', color: P.accent2, active: true },
            { name: 'Sprint Produit', color: P.green,   active: true },
            { name: 'Clients',        color: P.amber,   active: true },
            { name: 'Jours fériés',   color: P.red,     active: false },
          ].map(c => (
            <label key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer' }}>
              <span style={{
                width: 14, height: 14, borderRadius: 4,
                background: c.active ? c.color : 'transparent',
                border: `1.5px solid ${c.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
              }}>
                {c.active && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              <span style={{ fontSize: 13, color: c.active ? P.text : P.muted }}>{c.name}</span>
            </label>
          ))}
        </aside>
      </div>
    </AppShell>
  );
}

window.ScreenCalendar = ScreenCalendar;
