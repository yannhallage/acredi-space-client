export function DirectConversationEmpty() {
  return (
    <section className="dm-empty-state">
      <div className="dm-empty-card">
        <div className="dm-empty-icon">💬</div>

        <h2>Sélectionne une conversation</h2>

        <p>
          Clique sur une discussion à gauche pour afficher les messages.
        </p>
      </div>
    </section>
  );
}