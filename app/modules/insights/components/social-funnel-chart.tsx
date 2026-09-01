import { formatCompact } from "../format";
import type { Platform } from "../types";

type FunnelDatum = { label: string; value: number | null };

export function SocialFunnelChart({ platform, data }: { platform: Platform; data: FunnelDatum[] }) {
  const maximum = Math.max(...data.map((item) => item.value ?? 0), 1);
  return (
    <figure className={`social-funnel ${platform}`}>
      <header><span>{platform === "instagram" ? "IG" : "FB"}</span><div><p>{platform}</p><h3>Attention funnel</h3></div></header>
      <div className="funnel-bars" role="img" aria-label={`Funnel ${platform}: ${data.map((item) => `${item.label} ${item.value ?? "không có"}`).join(", ")}`}>
        {data.map((item) => <div key={item.label}><span>{item.label}</span><i><b style={{ width: `${Math.max(((item.value ?? 0) / maximum) * 100, item.value ? 2 : 0)}%` }} /></i><strong>{formatCompact(item.value)}</strong></div>)}
      </div>
      <figcaption>Các tầng có thể khác độ phủ ngày; dùng để thấy độ rơi, không coi là cohort conversion.</figcaption>
    </figure>
  );
}
