import { SKELETON_CARDS } from "../../constants";
import { ListSkeleton } from "./DashboardSkeletons";

export function DashboardSkeleton() {
  return (
    <div className="min-w-0 space-y-6">
      <header className="flex items-start justify-between gap-5">
        <div className="min-w-0 space-y-2.5">
          <div className="h-2.5 w-32 animate-pulse rounded-full bg-[var(--surface-2)]" />
          <div className="h-6 w-52 animate-pulse rounded-md bg-[var(--surface-2)]" />
          <div className="h-3.5 w-40 animate-pulse rounded-full bg-[var(--surface-2)]" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-[var(--surface-2)]" />
      </header>
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
