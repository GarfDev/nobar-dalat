import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatPercent } from "../format";

export function KpiCard({
  eyebrow,
  value,
  delta,
  source,
  note,
  accent = "brass",
}: {
  eyebrow: string;
  value: string;
  delta?: number | null;
  source: string;
  note?: string;
  accent?: "brass" | "red" | "teal";
}) {
  const DeltaIcon = delta === undefined || delta === null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <article className={`kpi-card kpi-${accent}`}>
      <div className="kpi-top"><span>{eyebrow}</span><small>{source}</small></div>
      <strong>{value}</strong>
      {delta !== undefined && (
        <div className={`kpi-delta ${(delta ?? 0) < 0 ? "is-negative" : ""}`}>
          <DeltaIcon size={14} aria-hidden="true" />
          <span>{formatPercent(delta, true)} so với kỳ trước</span>
        </div>
      )}
      {note && <p>{note}</p>}
    </article>
  );
}
