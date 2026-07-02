import { Icon } from "../../../../shared/ui";

export function DirectConversationEmpty() {
  return (
    <section className="dm-empty-state">
      <div className="dm-empty-panel">
        <div className="dm-empty-mark" aria-hidden="true">
          <Icon name="message" size={30} />
        </div>

        <span className="dm-kicker">Messages directs</span>
        <h2>Choisis une conversation</h2>

        <p>
          Selectionne une discussion a gauche pour afficher les messages.
        </p>
      </div>
    </section>
  );
}
