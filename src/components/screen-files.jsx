// ÉCRAN 03 — Explorateur de fichiers
// Breadcrumb + filtres + grille de fichiers + panneau preview à droite.

import React from 'react';

function ScreenFiles() {
  const { dark } = useTheme();
  const P = getPalette(dark);
  const [view, setView] = React.useState('grid');

  const files = [
    { name: 'Brief identité v0.1.pdf',           ext: 'pdf', color: P.red,     size: '2.4 Mo', when: 'hier',          by: 'Yann Hallage',    selected: true },
    { name: 'Acredi Space — Design System.fig',  ext: 'fig', color: P.accent2, size: '18 Mo',  when: 'il y a 2 j',     by: 'Aïcha Bamba' },
    { name: 'Roadmap Q2 — production.xlsx',      ext: 'xls', color: P.green,   size: '124 Ko', when: 'il y a 3 j',     by: 'Mohamed Doumbia' },
    { name: 'Logo — exports SVG.zip',            ext: 'zip', color: P.muted,   size: '486 Ko', when: 'il y a 5 j',     by: 'Yann Hallage' },
    { name: 'Note interne — naming.md',          ext: 'md',  color: P.accent,  size: '12 Ko',  when: 'il y a 1 sem',   by: 'Mlle Yéo' },
    { name: 'Pres. soutenance — v3.pptx',        ext: 'ppt', color: P.amber,   size: '6.8 Mo', when: 'il y a 1 sem',   by: 'Mohamed Doumbia' },
    { name: 'Wireframes — flow login.png',       ext: 'png', color: P.accent2, size: '1.1 Mo', when: 'il y a 2 sem',   by: 'Aïcha Bamba' },
    { name: 'Procès-verbal réunion 12 mai.docx', ext: 'doc', color: P.accent,  size: '88 Ko',  when: 'il y a 2 sem',   by: 'Issa Koné' },
    { name: 'Audit performance.pdf',             ext: 'pdf', color: P.red,     size: '3.2 Mo', when: 'il y a 3 sem',   by: 'Issa Koné' },
    { name: 'Démo — Acredi Space.mp4',           ext: 'mp4', color: P.amber,   size: '124 Mo', when: 'il y a 1 mois',  by: 'Yann Hallage' },
  ];
  const folders = [
    { name: '01 — Identité visuelle', count: 18, color: P.accent },
    { name: '02 — Brief & spec',      count: 7,  color: P.accent2 },
    { name: '03 — Réunions & PV',     count: 24, color: P.green },
    { name: '04 — Marketing',         count: 11, color: P.amber },
  ];

  const selected = files.find(f => f.selected);

  const FileIcon = ({ ext, color, size = 30 }) => (
    <span style={{
      width: size, height: size, borderRadius: 6,
      background: `${color}22`, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
      textTransform: 'uppercase', flex: 'none',
    }}>{ext}</span>
  );

  return (
    <AppShell active="files">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', height: '100%' }}>

        {/* ===== LEFT — explorer ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, padding: '24px 32px 32px', overflow: 'auto' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: P.muted, marginBottom: 4 }}>
            <a href="#" style={{ color: P.muted, textDecoration: 'none' }}>Mes fichiers</a>
            <Icon name="chevRight" size={12} />
            <a href="#" style={{ color: P.muted, textDecoration: 'none' }}>Acredi Space</a>
            <Icon name="chevRight" size={12} />
            <span style={{ color: P.text, fontWeight: 500 }}>01 — Identité visuelle</span>
          </div>

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12, marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em' }}>01 — Identité visuelle</h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: P.muted }}>18 fichiers · 4 dossiers · 234 Mo · partagé avec 8 personnes</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ background: P.surface, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="users" size={14} /> Inviter
              </button>
              <button style={{ background: P.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="plus" size={14} color="#fff" /> Importer
              </button>
            </div>
          </div>

          {/* Filter row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 4, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, padding: 3 }}>
              {['Tous', 'Documents', 'Images', 'Vidéos', 'Archives'].map((f, i) => (
                <button key={f} style={{
                  background: i === 0 ? P.surface2 : 'transparent',
                  color: i === 0 ? P.text : P.muted,
                  border: 'none', borderRadius: 6, padding: '5px 12px',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>{f}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <button style={{ background: 'transparent', color: P.muted, border: `1px solid ${P.border}`, borderRadius: 8, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Trier · Récents <Icon name="chevDown" size={12} />
            </button>
            <div style={{ display: 'flex', gap: 2, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, padding: 3 }}>
              <button onClick={() => setView('grid')} style={{ background: view === 'grid' ? P.surface2 : 'transparent', color: view === 'grid' ? P.text : P.muted, border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', display: 'flex' }}>
                <Icon name="folder" size={15} />
              </button>
              <button onClick={() => setView('list')} style={{ background: view === 'list' ? P.surface2 : 'transparent', color: view === 'list' ? P.text : P.muted, border: 'none', borderRadius: 6, padding: 6, cursor: 'pointer', display: 'flex' }}>
                <Icon name="moreH" size={15} />
              </button>
            </div>
          </div>

          {/* Folders */}
          <div style={{ fontSize: 11, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12 }}>Dossiers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
            {folders.map(f => (
              <div key={f.name} style={{
                background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10,
                padding: 14, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${f.color}22`, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                }}>
                  <Icon name="folder" size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{f.count} fichiers</div>
                </div>
              </div>
            ))}
          </div>

          {/* Files */}
          <div style={{ fontSize: 11, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>Fichiers</span>
            <span>10 sur 124</span>
          </div>

          {view === 'list' ? (
            <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 130px 160px 40px', padding: '10px 16px', borderBottom: `1px solid ${P.border}`, fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                <span></span><span>Nom</span><span style={{ textAlign: 'right' }}>Taille</span><span>Modifié</span><span>Par</span><span></span>
              </div>
              {files.map((f, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 130px 160px 40px', alignItems: 'center', padding: '10px 16px', borderBottom: i < files.length - 1 ? `1px solid ${P.borderSubtle}` : 'none', background: f.selected ? P.accentSoft : 'transparent', cursor: 'pointer' }}>
                  <FileIcon ext={f.ext} color={f.color} size={26} />
                  <span style={{ fontSize: 13, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace', textAlign: 'right' }}>{f.size}</span>
                  <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{f.when}</span>
                  <span style={{ fontSize: 12, color: P.mutedSoft, display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={f.by} size={20} />{f.by}</span>
                  <button style={{ background: 'transparent', border: 'none', color: P.muted, cursor: 'pointer', padding: 4 }}><Icon name="moreH" size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {files.map((f, i) => (
                <div key={i} style={{
                  background: P.surface, border: `1px solid ${f.selected ? P.accent : P.border}`, borderRadius: 10,
                  overflow: 'hidden', cursor: 'pointer',
                  boxShadow: f.selected ? `0 0 0 2px ${P.accentSoft}` : 'none',
                }}>
                  <div style={{
                    aspectRatio: '4/3', background: `${f.color}11`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderBottom: `1px solid ${P.borderSubtle}`,
                  }}>
                    <FileIcon ext={f.ext} color={f.color} size={48} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: P.muted, fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{f.size}</span>
                      <span>{f.when}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== RIGHT — preview ===== */}
        <aside style={{
          background: P.bg, borderLeft: `1px solid ${P.border}`,
          padding: 24, display: 'flex', flexDirection: 'column', overflow: 'auto',
        }}>
          {selected ? (
            <>
              <div style={{
                aspectRatio: '4/5', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
                position: 'relative', overflow: 'hidden',
              }}>
                <FileIcon ext={selected.ext} color={selected.color} size={72} />
                <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, color: P.muted, fontFamily: 'JetBrains Mono, monospace', background: P.bg, padding: '3px 7px', borderRadius: 4, border: `1px solid ${P.border}` }}>Aperçu indisponible</div>
              </div>

              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', wordBreak: 'break-word' }}>{selected.name}</h2>
              <p style={{ margin: '6px 0 20px', fontSize: 12, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{selected.ext.toUpperCase()} · {selected.size}</p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button style={{ flex: 1, background: P.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 14px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Ouvrir</button>
                <button style={{ background: P.surface, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, padding: 9, cursor: 'pointer', display: 'flex' }}>
                  <Icon name="download" size={14} />
                </button>
                <button style={{ background: P.surface, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, padding: 9, cursor: 'pointer', display: 'flex' }}>
                  <Icon name="users" size={14} />
                </button>
                <button style={{ background: P.surface, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8, padding: 9, cursor: 'pointer', display: 'flex' }}>
                  <Icon name="moreH" size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>Détails</div>
                  {[
                    ['Type', 'Document PDF'],
                    ['Modifié', '20 mai 2026, 14:32'],
                    ['Créé', '15 mai 2026, 09:18'],
                    ['Auteur', selected.by],
                    ['Chemin', '/Acredi Space/01—Identité'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '6px 0', fontSize: 12, borderBottom: `1px solid ${P.borderSubtle}` }}>
                      <span style={{ color: P.muted }}>{k}</span>
                      <span style={{ color: P.text, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: 11, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Partagé avec</span><span>8</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    {['Yann Hallage', 'Issa Koné', 'Mlle Yéo', 'Aïcha Bamba', 'Mohamed Doumbia'].map((n, j) => (
                      <span key={n} style={{ marginLeft: j === 0 ? 0 : -8 }}><Avatar name={n} size={28} ring={P.bg} /></span>
                    ))}
                    <span style={{ marginLeft: 8, fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>+3</span>
                  </div>
                  <button style={{ width: '100%', background: 'transparent', color: P.accent, border: `1px dashed ${P.border}`, borderRadius: 8, padding: '8px 12px', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Icon name="plus" size={13} /> Inviter une personne
                  </button>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: P.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', marginBottom: 10 }}>Activité</div>
                  {[
                    { who: 'Yann Hallage', what: 'a téléchargé', when: '14 min' },
                    { who: 'Issa Koné',    what: 'a commenté',  when: '2 h' },
                    { who: 'Mlle Yéo',     what: 'a ouvert',    when: 'hier' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 12 }}>
                      <Avatar name={a.who} size={24} />
                      <span style={{ flex: 1, color: P.text }}>
                        <b style={{ fontWeight: 500 }}>{a.who}</b>
                        <span style={{ color: P.muted }}> {a.what}</span>
                      </span>
                      <span style={{ fontSize: 11, color: P.muted, fontFamily: 'JetBrains Mono, monospace' }}>{a.when}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: P.muted, fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Sélectionnez un fichier pour voir le détail</div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}

window.ScreenFiles = ScreenFiles;
