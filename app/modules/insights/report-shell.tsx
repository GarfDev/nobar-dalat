import { useSearchParams, Link } from "react-router";
import type { ReactNode } from "react";
import type { DateRange, ISODate } from "./types";
import { clampRange } from "./reporting";
import { formatDate } from "./format";
import "./reports.css";
import { calendarRange } from "./growth-insights";

const coverage: DateRange = { start: "2024-09-01", end: "2026-08-31" };
const defaults: DateRange = { start: "2026-08-01", end: "2026-08-31" };
export function validReportDate(value: string | null): value is ISODate {
  return (
    !!value &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function useReportRange() {
  const [params, setParams] = useSearchParams();
  const start = params.get("from"),
    end = params.get("to");
  const range =
    validReportDate(start) && validReportDate(end) && start <= end
      ? clampRange({ start, end }, coverage)
      : defaults;
  const setRange = (next: DateRange) => {
    if (
      !validReportDate(next.start) ||
      !validReportDate(next.end) ||
      next.start > next.end
    )
      return;
    const safe = clampRange(next, coverage);
    setParams({ from: safe.start, to: safe.end });
  };
  return { range, setRange };
}
export function reportHref(path: string, range: DateRange) {
  return path + "?from=" + range.start + "&to=" + range.end;
}
export function ReportNavigation({
  active,
  range,
}: {
  active: string;
  range: DateRange;
}) {
  return (
    <nav className="report-tabs" aria-label="Loại báo cáo">
      <span className="report-brand">
        NO<span> / Báo cáo quản trị</span>
      </span>
      <div>
        {[
          ["/insights", "Tổng hợp"],
          ["/insights/finance", "Tài chính"],
          ["/insights/marketing", "Marketing"],
        ].map(([path, label]) => (
          <Link
            key={path}
            to={reportHref(path, range)}
            aria-current={active === path ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
export function ReportShell({
  active,
  title,
  description,
  children,
}: {
  active: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { range } = useReportRange();
  return (
    <main className="insights-page reports-page">
      <ReportNavigation active={active} range={range} />
      <header className="reports-heading">
        <p>NObar · Báo cáo nội bộ</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <small>Dữ liệu đã chốt đến 31/08/2026 · Không cập nhật trực tiếp</small>
      </header>
      <ReportFilters />
      <div className="reports-body">{children}</div>
      <footer className="reports-footer">
        Kỳ đang xem: {formatDate(range.start)}–{formatDate(range.end)} · Nguồn
        và mức độ đầy đủ được ghi ngay tại từng phần báo cáo.
      </footer>
    </main>
  );
}

export function ReportFilters() {
  const { range, setRange } = useReportRange();
  const month = range.end.slice(0, 7);
  const counts = [1, 3, 6, 12];
  const active = counts.find((n) => {
    const r = calendarRange(month, n);
    return r.start === range.start && r.end === range.end;
  });
  return (
    <div className="reports-filters">
      <div>
        {counts.map((n) => (
          <button
            key={n}
            aria-pressed={active === n}
            onClick={() => setRange(calendarRange(month, n))}
          >
            {n === 1 ? "Trong tháng" : `${n} tháng`}
          </button>
        ))}
      </div>
      <div>
        <label>
          Tháng kết thúc
          <input
            type="month"
            min="2024-09"
            max="2026-08"
            value={month}
            onChange={(e) => {
              if (/^\d{4}-\d{2}$/.test(e.target.value))
                setRange(calendarRange(e.target.value, active ?? 1));
            }}
          />
        </label>
        <label>
          Từ ngày
          <input
            type="date"
            min={coverage.start}
            max={range.end}
            value={range.start}
            onChange={(e) =>
              setRange({ ...range, start: e.target.value as ISODate })
            }
          />
        </label>
        <label>
          Đến ngày
          <input
            type="date"
            min={range.start}
            max={coverage.end}
            value={range.end}
            onChange={(e) =>
              setRange({ ...range, end: e.target.value as ISODate })
            }
          />
        </label>
      </div>
      <small>
        Chọn số tháng liên tiếp tính đến tháng kết thúc. Dữ liệu lịch sử chốt
        08/2026; cập nhật social mới hơn nằm riêng trong Marketing.
      </small>
    </div>
  );
}
