import type { ProductPerformance } from "./types";

export type RankedProduct = {
  product: string;
  quantity: number;
  revenue: number;
};

export function aggregateProductRanking(rows: ProductPerformance[]): RankedProduct[] {
  const products = new Map<string, RankedProduct>();
  for (const row of rows) {
    const trimmedName = row.product.trim();
    const key = trimmedName.toLocaleLowerCase("vi");
    const current = products.get(key) ?? {
      product: key === "bespoke" ? "Bespoke" : trimmedName,
      quantity: 0,
      revenue: 0,
    };
    current.quantity += row.quantity;
    current.revenue += row.revenue;
    products.set(key, current);
  }
  return [...products.values()].sort((a, b) => b.revenue - a.revenue);
}
