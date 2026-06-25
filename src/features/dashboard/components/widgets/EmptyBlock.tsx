import { Icon } from "../../../../shared/ui";

type EmptyBlockProps = {
  body: string;
  title: string;
};

export function EmptyBlock({ body, title }: EmptyBlockProps) {
  return (
    <div className="grid min-h-[130px] place-items-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-5 py-5 text-center">
      <div className="space-y-2.5">
        <Icon className="mx-auto text-[var(--muted-soft)]" name="search" size={17} />
        <p className="text-[12px] font-semibold text-[var(--text)]">{title}</p>
        <p className="mx-auto max-w-[240px] text-[11px] leading-5 text-[var(--muted)]">{body}</p>
      </div>
    </div>
  );
}

export function PanelState({ body, title }: EmptyBlockProps) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <div className="space-y-2.5">
        <Icon className="mx-auto text-[var(--muted-soft)]" name="alert" size={20} />
        <h1 className="text-[15px] font-semibold text-[var(--text)]">{title}</h1>
        <p className="max-w-md text-[12px] leading-5 text-[var(--muted)]">{body}</p>
      </div>
    </div>
  );
}
