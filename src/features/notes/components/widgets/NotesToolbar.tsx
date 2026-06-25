import { Icon } from "../../../../shared/ui";
import type { SortMode } from "../../utils";

type NotesToolbarProps = {
  contentFilter: string;
  isFetching: boolean;
  isLoading: boolean;
  onContentFilterChange: (value: string) => void;
  onRefresh: () => void;
  onSortToggle: () => void;
  onTitleFilterChange: (value: string) => void;
  titleFilter: string;
};

export function NotesToolbar({
  contentFilter,
  isFetching,
  isLoading,
  onContentFilterChange,
  onRefresh,
  onSortToggle,
  onTitleFilterChange,
  titleFilter,
}: NotesToolbarProps) {
  return (
    <section className="notes-filters" aria-label="Notes filters">
      <div className="notes-filter-inputs">
        <label>
          <span>Title</span>
          <input
            value={titleFilter}
            onChange={(event) => onTitleFilterChange(event.target.value)}
            placeholder="Title"
          />
        </label>

        <label>
          <span>Content</span>
          <input
            value={contentFilter}
            onChange={(event) => onContentFilterChange(event.target.value)}
            placeholder="Content"
          />
        </label>
      </div>

      <div className="notes-filter-actions">
        <button
          className="icon-button bordered"
          type="button"
          aria-label="Refresh notes"
          disabled={isFetching}
          onClick={onRefresh}
        >
          {isFetching && !isLoading ? (
            <span className="skeleton-dot notes-refresh-skeleton" />
          ) : (
            <Icon name="refresh" size={14} />
          )}
        </button>

        <button className="button ghost" type="button" onClick={onSortToggle}>
          <Icon name="sort" size={14} />
          Sort
        </button>
      </div>
    </section>
  );
}

export type { SortMode };
