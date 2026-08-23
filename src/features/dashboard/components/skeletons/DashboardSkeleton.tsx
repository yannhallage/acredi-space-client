import { SKELETON_CARDS } from "../../constants";
import { ListSkeleton } from "./DashboardSkeletons";

export function DashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-6">
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex min-h-[220px] flex-col lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-6 sm:px-8">
            <div className="h-4 w-36 animate-pulse rounded-full bg-[var(--surface-2)]" />
            <div className="mt-3 h-7 w-72 max-w-full animate-pulse rounded-md bg-[var(--surface-2)]" />
            <div className="mt-4 h-3.5 w-64 max-w-full animate-pulse rounded-full bg-[var(--surface-2)]" />
            <div className="mt-6 h-10 w-44 animate-pulse rounded-lg bg-[var(--surface-2)]" />
          </div>
          <div className="h-[180px] w-full animate-pulse bg-[var(--surface-2)] sm:h-[210px] lg:h-auto lg:min-h-[240px] lg:w-[46%]" />
        </div>
      </div>
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-4 lg:grid-cols-2">
        {SKELETON_CARDS.map((card) => (
          <div className="min-h-[190px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5" key={card}>
            <div className="mb-5 flex items-center justify-between">
              <div className="h-3 w-32 animate-pulse rounded-full bg-[var(--surface-2)]" />
              <div className="h-7 w-7 animate-pulse rounded-md bg-[var(--surface-2)]" />
            </div>
            <ListSkeleton />
          </div>
        ))}
      </section>
    </div>
  );
}
