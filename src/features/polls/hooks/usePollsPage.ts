import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePolls, type PollStatus } from "../../../shared/api/polls";
import { mapPollToCard } from "../utils";

export function usePollsPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<PollStatus | "ALL">("ALL");

  const listParams =
    statusFilter === "ALL" ? undefined : { status: statusFilter };

  const pollsQuery = usePolls(listParams);

  const polls = useMemo(
    () => (pollsQuery.data ?? []).map(mapPollToCard),
    [pollsQuery.data]
  );

  const isCollectionEmpty =
    statusFilter === "ALL" &&
    !pollsQuery.isLoading &&
    !pollsQuery.isError &&
    polls.length === 0;

  return {
    error: pollsQuery.error,
    isCollectionEmpty,
    isError: pollsQuery.isError,
    isFetching: pollsQuery.isFetching,
    isLoading: pollsQuery.isLoading,
    isPollsInitialLoading: pollsQuery.isLoading && !pollsQuery.data,
    isPollsLoading: pollsQuery.isLoading || pollsQuery.isFetching,
    polls,
    refreshPolls: () => pollsQuery.refetch(),
    setStatusFilter,
    statusFilter,
    openCreate: () => navigate("/app/polls/create"),
  };
}
