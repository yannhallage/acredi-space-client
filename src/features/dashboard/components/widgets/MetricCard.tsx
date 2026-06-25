type MetricCardProps = {
  label: string;
  value: string;
  variant?: "blue" | "dark" | "green";
};

export function MetricCard({
  label,
  value,
  variant = "dark",
}: MetricCardProps) {
  const valueColor =
    variant === "blue" ? "text-[#5B6CFF]" : variant === "green" ? "text-emerald-600" : "text-[var(--text)]";

  return (
    <div className="min-w-0 rounded-lg bg-[var(--surface-2)] p-4">
      <strong className={`block text-[22px] font-semibold leading-none tracking-normal ${valueColor}`}>{value}</strong>
      <span className="mt-2 block truncate text-[11px] text-[var(--muted)]">{label}</span>
    </div>
  );
}
