import type { PollStatus } from "../../../../shared/api/polls";
import { Icon } from "../../../../shared/ui";
import { getPollStatusLabel } from "../../utils";

const STATUS_FILTERS: Array<PollStatus | "ALL"> = [
  "ALL",
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
];

type PollsToolbarProps = {
  isFetching?: boolean;
  isLoading?: boolean;
  onRefresh: () => void;
  onStatusChange: (status: PollStatus | "ALL") => void;
  statusFilter: PollStatus | "ALL";
};

export function PollsToolbar({
  isFetching = false,
  isLoading = false,
  onRefresh,
  onStatusChange,
  statusFilter,
}: PollsToolbarProps) {
  return (
    <div className="pb-toolbar">
      <div className="pb-toolbar-filters">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            className={
              statusFilter === status
                ? "pb-filter-chip pb-filter-chip-active"
                : "pb-filter-chip"
            }
            type="button"
            onClick={() => onStatusChange(status)}
          >
            {status === "ALL" ? "Tous" : getPollStatusLabel(status)}
          </button>
        ))}
      </div>

      <button
        className="pb-toolbar-refresh"
        disabled={isLoading || isFetching}
        type="button"
        aria-label="Actualiser"
        onClick={onRefresh}
      >
        <Icon name="refresh" size={14} />
      </button>
    </div>
  );
}
