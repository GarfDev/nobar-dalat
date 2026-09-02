import type { DateRange, ISODate } from "./types";

export type ReportMode = "preliminary" | "detailed";

const PRESETS: Array<{ label: string; range: DateRange }> = [
  { label: "7 ngày", range: { start: "2026-08-25", end: "2026-08-31" } },
  { label: "30 ngày", range: { start: "2026-08-02", end: "2026-08-31" } },
  { label: "90 ngày", range: { start: "2026-06-03", end: "2026-08-31" } },
  { label: "Năm 2026", range: { start: "2026-01-01", end: "2026-08-31" } },
  { label: "12 tháng", range: { start: "2025-09-01", end: "2026-08-31" } },
  { label: "Toàn bộ", range: { start: "2024-09-01", end: "2026-08-31" } },
];

export function RangeControls({
  range,
  mode,
  onRange,
  onMode,
}: {
  range: DateRange;
  mode: ReportMode;
  onRange: (range: DateRange) => void;
  onMode: (mode: ReportMode) => void;
}) {
  const update = (key: "start" | "end", value: string) =>
    onRange({ ...range, [key]: value as ISODate });

  return (
    <div className="insights-controls" aria-label="Bộ lọc báo cáo">
      <div className="preset-strip" role="group" aria-label="Khoảng thời gian nhanh">
        {PRESETS.map((preset) => {
          const active = preset.range.start === range.start && preset.range.end === range.end;
          return (
            <button
              type="button"
              className={active ? "is-active" : ""}
              aria-pressed={active}
              onClick={() => onRange(preset.range)}
              key={preset.label}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="control-fields">
        <label>
          <span>Từ ngày</span>
          <input
            type="date"
            min="2024-09-01"
            max={range.end}
            value={range.start}
            onChange={(event) => update("start", event.target.value)}
          />
        </label>
        <label>
          <span>Đến ngày</span>
          <input
            type="date"
            min={range.start}
            max="2026-08-31"
            value={range.end}
            onChange={(event) => update("end", event.target.value)}
          />
        </label>
        <div className="mode-switch" role="group" aria-label="Mức độ chi tiết">
          <button type="button" className={mode === "preliminary" ? "is-active" : ""} onClick={() => onMode("preliminary")}>Sơ bộ</button>
          <button type="button" className={mode === "detailed" ? "is-active" : ""} onClick={() => onMode("detailed")}>Chi tiết</button>
        </div>
      </div>
    </div>
  );
}
