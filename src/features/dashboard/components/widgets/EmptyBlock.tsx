import { useTheme } from "../../../../shared/theme/ThemeProvider";
import { Icon } from "../../../../shared/ui";
import {
  getEmptyIllustration,
  type EmptyIllustration,
} from "../../../../shared/illustrations/emptyIllustrations";

type EmptyBlockProps = {
  body: string;
  illustration?: EmptyIllustration;
  title: string;
};

type EmptyIllustrationProps = {
  illustration: EmptyIllustration;
  size?: "compact" | "panel";
};

function EmptyIllustration({ illustration, size = "compact" }: EmptyIllustrationProps) {
  const { dark } = useTheme();
  const isPanel = size === "panel";

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
        isPanel ? "px-6 py-5" : "px-4 py-3"
      }`}
    >
      <img
        alt=""
        aria-hidden="true"
        className={`mx-auto block object-contain ${
          isPanel ? "h-[220px] max-w-[320px]" : "h-[140px] max-w-[220px]"
        }`}
        loading="lazy"
        src={getEmptyIllustration(illustration, dark)}
      />
    </div>
  );
}

export function EmptyBlock({ body, illustration, title }: EmptyBlockProps) {
  return (
    <div className="grid min-h-[260px] place-items-center rounded-lg border border-dashed border-[var(--border)] px-4 py-5 text-center">
      <div className="flex w-full max-w-[320px] flex-col items-center gap-3">
        {illustration ? (
          <EmptyIllustration illustration={illustration} />
        ) : (
          <Icon className="text-[var(--muted-soft)]" name="search" size={17} />
        )}
        <div className="space-y-1">
          <p className="text-[12px] font-semibold text-[var(--text)]">{title}</p>
          <p className="text-[11px] leading-5 text-[var(--muted)]">{body}</p>
        </div>
      </div>
    </div>
  );
}

export function PanelState({ body, illustration, title }: EmptyBlockProps) {
  return (
    <div className="grid min-h-[400px] place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
      <div className="flex max-w-lg flex-col items-center gap-4">
        {illustration ? (
          <EmptyIllustration illustration={illustration} size="panel" />
        ) : (
          <Icon className="text-[var(--muted-soft)]" name="alert" size={20} />
        )}
        <div className="space-y-2">
          <h1 className="text-[15px] font-semibold text-[var(--text)]">{title}</h1>
          <p className="text-[12px] leading-5 text-[var(--muted)]">{body}</p>
        </div>
      </div>
    </div>
  );
}
