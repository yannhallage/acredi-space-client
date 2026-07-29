import { SKELETON_ROWS } from "../../constants";

type ListSkeletonProps = {
  rows?: number;
};

export function ListSkeleton({ rows = 4 }: ListSkeletonProps) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {SKELETON_ROWS.slice(0, rows).map((row) => (
        <div className="flex min-w-0 items-center gap-2.5" key={row}>
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--surface-2)]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-4/5 animate-pulse rounded-full bg-[var(--surface-2)]" />
            <div className="h-2.5 w-2/5 animate-pulse rounded-full bg-[var(--surface-2)] opacity-70" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {SKELETON_ROWS.slice(0, 4).map((row) => (
        <div className="rounded-lg bg-[var(--surface-2)] p-4" key={row}>
          <div className="mb-3 h-6 w-12 animate-pulse rounded-md bg-[var(--surface-3)]" />
          <div className="h-2.5 w-20 animate-pulse rounded-full bg-[var(--surface-3)]" />
        </div>
      ))}
    </div>
  );
}
