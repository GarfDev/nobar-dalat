export function formatVND(value: number | null): string {
  if (value === null) return "Chưa đủ dữ liệu";
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)}\u00a0₫`;
}

export function formatNumber(value: number | null): string {
  if (value === null) return "Chưa đủ dữ liệu";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}

export function formatCompact(value: number | null): string {
  if (value === null) return "—";
  if (Math.abs(value) < 1_000) return formatNumber(value);
  if (Math.abs(value) < 1_000_000) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value / 1_000)} nghìn`;
  }
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value / 1_000_000)} triệu`;
}

export function formatDecimal(value: number | null, maximumFractionDigits = 1): string {
  if (value === null || !Number.isFinite(value)) return "Chưa đủ dữ liệu";
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits }).format(value);
}

export function formatPercent(value: number | null, signed = false): string {
  if (value === null || !Number.isFinite(value)) return "Chưa đủ dữ liệu";
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value);
  return formatted;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
