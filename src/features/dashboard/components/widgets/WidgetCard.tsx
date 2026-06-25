import type { ReactNode } from "react";

import type { DashboardWidgetConfig } from "../../../../shared/api/dashboard";
import { Icon } from "../../../../shared/ui";
import { WIDE_WIDGETS, WIDGET_ICON } from "../../constants";

type WidgetCardProps = {
  children: ReactNode;
  widget: DashboardWidgetConfig;
};

export function WidgetCard({ children, widget }: WidgetCardProps) {
  return (
    <section
      className={[
        "min-w-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.08)]",
        "transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.12)]",
        WIDE_WIDGETS.has(widget.type) ? "lg:col-span-2" : "",
      ].join(" ")}
    >
      <header className="mb-5 flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="shrink-0 text-[#5B6CFF]" name={WIDGET_ICON[widget.type]} size={15} />
          <h2 className="truncate text-[11px] font-semibold uppercase tracking-[0.02em] text-[var(--text)]">
            {widget.label}
          </h2>
        </div>
        <button
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--muted-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          type="button"
          aria-label={`Options ${widget.label}`}
        >
          <Icon name="moreH" size={15} />
        </button>
      </header>
      {children}
    </section>
  );
}
