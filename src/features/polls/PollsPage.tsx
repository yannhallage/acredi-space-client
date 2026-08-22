import { PERMISSIONS, PermissionGate } from "../../shared/permissions";
import { Icon } from "../../shared/ui";
import {
  PollCard,
  PollCardSkeleton,
  PollsEmptyState,
  PollsFilteredEmpty,
  PollsPageSkeleton,
  PollsToolbar,
} from "./components";
import { usePollsPage } from "./hooks/usePollsPage";
import { pollSkeletonKeys } from "./utils";
import "./polls.css";

export function PollsPage() {
  const page = usePollsPage();
  const showWelcomeEmpty =
    !page.isError && !page.isPollsLoading && page.isCollectionEmpty;

  if (page.isPollsInitialLoading) {
    return <PollsPageSkeleton />;
  }

  return (
    <div
      className={
        showWelcomeEmpty
          ? "polls-page polls-board pb-board-empty"
          : "polls-page polls-board"
      }
    >
      <PollsToolbar
        isFetching={page.isFetching}
        isLoading={page.isLoading}
        onRefresh={() => {
          page.refreshPolls().catch(() => undefined);
        }}
        onStatusChange={page.setStatusFilter}
        statusFilter={page.statusFilter}
      />

      <section
        className={
          page.isPollsLoading
            ? "pb-grid pb-grid-loading"
            : showWelcomeEmpty
              ? "pb-empty-page-section"
              : "pb-grid"
        }
        aria-label="Liste des sondages"
        aria-busy={page.isPollsLoading}
      >
        {page.isPollsLoading ? (
          pollSkeletonKeys.map((item) => <PollCardSkeleton key={item} />)
        ) : page.isError && page.polls.length === 0 ? (
          <div className="pb-filtered-empty">
            <Icon name="alert" size={14} />
            <strong>Impossible de charger les sondages</strong>
            <span>{page.error?.message}</span>
          </div>
        ) : showWelcomeEmpty ? (
          <PollsEmptyState onCreate={page.openCreate} />
        ) : page.polls.length === 0 ? (
          <PollsFilteredEmpty />
        ) : (
          page.polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
        )}
      </section>

      {!page.isPollsLoading && !page.isCollectionEmpty ? (
        <PermissionGate permission={PERMISSIONS.CREATE_POLLS}>
          <div className="pb-add-fab">
            <button
              className="pb-add"
              type="button"
              aria-label="Créer un sondage"
              onClick={page.openCreate}
            >
              <span className="pb-add-plus" aria-hidden="true" />
            </button>
          </div>
        </PermissionGate>
      ) : null}
    </div>
  );
}
