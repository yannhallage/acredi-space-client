import { buildDonutSegments } from "../../utils";

type DonutOption = {
  optionId: string;
  label: string;
  count: number;
};

type PollDonutKpiProps = {
  title?: string;
  totalLabel?: string;
  options: DonutOption[];
};

export function PollDonutKpi({
  title = "Répartition des votes",
  totalLabel = "Total",
  options,
}: PollDonutKpiProps) {
  const chart = buildDonutSegments(options);

  return (
    <div className="pd-donut-card">
      <header className="pd-donut-header">
        <h3>{title}</h3>
      </header>

      <div className="pd-donut-visual">
        <svg viewBox="0 0 140 140" className="pd-donut-svg" aria-hidden="true">
          {chart.segments.map((segment) => (
            <circle
              key={segment.id}
              cx="70"
              cy="70"
              r={chart.radius}
              fill="transparent"
              stroke={segment.color}
              strokeWidth="12"
              strokeDasharray={segment.dasharray}
              strokeDashoffset={segment.dashoffset}
              strokeLinecap="butt"
              transform="rotate(-90 70 70)"
            />
          ))}
        </svg>
        <div className="pd-donut-center">
          <span>{totalLabel}</span>
          <strong>{chart.total}</strong>
        </div>
      </div>

      <ul className="pd-donut-legend">
        {chart.segments.map((segment) => (
          <li key={segment.id}>
            <span
              className="pd-donut-swatch"
              style={{ background: segment.color }}
            />
            <span className="pd-donut-label">{segment.label}</span>
            <span className="pd-donut-value">
              {segment.count}
              {chart.total > 0 ? (
                <small> · {Math.round(segment.percentage)}%</small>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
