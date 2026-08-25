import { Icon } from "../../../shared/ui";

export type ChecklistScreen = "board" | "participant";

type ChecklistViewSwitcherProps = {
  participantCount: number;
  value: ChecklistScreen;
  onChange: (screen: ChecklistScreen) => void;
};

export function ChecklistViewSwitcher({
  participantCount,
  value,
  onChange,
}: ChecklistViewSwitcherProps) {
  return (
    <nav className="cl-view-switcher" aria-label="Vues des listes">
      <button
        className={value === "board" ? "active" : undefined}
        type="button"
        onClick={() => onChange("board")}
      >
        <Icon name="checklists" size={15} />
        Mes listes
      </button>
      <button
        className={value === "participant" ? "active" : undefined}
        type="button"
        onClick={() => onChange("participant")}
      >
        <Icon name="users" size={15} />
        Participations
        {participantCount > 0 ? <em>{participantCount}</em> : null}
      </button>
    </nav>
  );
}
