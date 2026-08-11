export function AuthHero() {
  return (
    <aside className="auth-hero" aria-hidden="true">
      <div className="auth-hero-glow auth-hero-glow-a" />
      <div className="auth-hero-glow auth-hero-glow-b" />
      <div className="auth-hero-grid" />

      <div className="auth-hero-art">
        <img src="/custom/auth-hero.png" alt="" className="auth-hero-image" draggable={false} />
      </div>

      <div className="auth-hero-copy">
        <p className="auth-hero-kicker">Espace de travail</p>
        <h2>Tout collabore, ici.</h2>
        <p>Fichiers, équipes, réunions et conversations — un seul endroit pour avancer.</p>
      </div>
    </aside>
  );
}
