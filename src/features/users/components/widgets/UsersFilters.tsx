import { Icon } from "../../../../shared/ui";

export function UsersFilters({
  nameFilter,
  emailFilter,
  authLoading,
  canViewUsers,
  onNameFilterChange,
  onEmailFilterChange,
  onRefresh,
  onToggleSort,
}: {
  nameFilter: string;
  emailFilter: string;
  authLoading: boolean;
  canViewUsers: boolean;
  onNameFilterChange: (value: string) => void;
  onEmailFilterChange: (value: string) => void;
  onRefresh: () => void;
  onToggleSort: () => void;
}) {
  return (
    <section className="notes-filters" aria-label="Users filters">
      <div className="notes-filter-inputs">
        <label>
          <span>Name</span>
          <input
            value={nameFilter}
            onChange={(event) => onNameFilterChange(event.target.value)}
            placeholder="Name"
          />
        </label>

        <label>
          <span>Email</span>
          <input
            value={emailFilter}
            onChange={(event) => onEmailFilterChange(event.target.value)}
            placeholder="Email"
          />
        </label>
      </div>

      <div className="notes-filter-actions">
        <button
          className="icon-button bordered"
          type="button"
          aria-label="Refresh users"
          disabled={authLoading || !canViewUsers}
          onClick={onRefresh}
        >
          <Icon name="refresh" size={14} />
        </button>

        <button className="button ghost" type="button" onClick={onToggleSort}>
          <Icon name="sort" size={14} />
          Sort
        </button>
      </div>
    </section>
  );
}
