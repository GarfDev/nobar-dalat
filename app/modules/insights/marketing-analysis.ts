import type { ContentItem, DateRange, ISODate, Platform, SocialDay, TikTokPostSnapshot } from "./types";

type SocialMetric = "views" | "interactions" | "linkClicks" | "follows";

export type MonthlySocialPerformance = {
  month: string;
  platform: Platform;
  views: number | null;
  interactions: number | null;
  linkClicks: number | null;
  follows: number | null;
  interactionPerThousandViews: number | null;
  clicksPerThousandViews: number | null;
  followPerThousandViews: number | null;
  viewGrowth: number | null;
  interactionGrowth: number | null;
  complete: Record<SocialMetric, boolean>;
};

export type MarketingMomentum = {
  platform: Platform;
  latestMonth: string | null;
  strongestViewMonth: string | null;
  strongestInteractionMonth: string | null;
  latestViewGrowth: number | null;
  latestInteractionGrowth: number | null;
  latestFollowGrowth: number | null;
};

export type TikTokPostSignal = {
  id: string;
  label: string;
  date: ISODate;
  views: number;
  saveSharePerThousandViews: number | null;
  followersPerThousandViews: number | null;
  averageRetentionRate: number | null;
  completionRate: number;
};

export type MetaContentOpportunity = {
  id: string;
  label: string;
  date: ISODate;
  platform: Platform;
  format: ContentItem["format"];
  views: number;
  intentPerThousandViews: number;
  paidViewShare: number | null;
};

const DAY_MS = 86_400_000;

function safeDivide(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

function dateToDay(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS);
}

function monthBoundary(month: string, edge: "start" | "end"): ISODate {
  const [year, monthNumber] = month.split("-").map(Number);
  if (edge === "start") return `${month}-01` as ISODate;
  return new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10) as ISODate;
}

function expectedDays(month: string): number {
  return dateToDay(monthBoundary(month, "end")) - dateToDay(monthBoundary(month, "start")) + 1;
}

function sumMetric(rows: SocialDay[], metric: SocialMetric): number | null {
  const values = rows.map((row) => row[metric]).filter((value): value is number => value !== null);
  return values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0);
}

function growth(current: number | null, previous: number | null): number | null {
  return current === null || previous === null || previous === 0 ? null : (current - previous) / previous;
}

export function buildMonthlySocialPerformance(
  rows: SocialDay[],
  range: DateRange,
): MonthlySocialPerformance[] {
  const selected = rows.filter((row) => row.date >= range.start && row.date <= range.end);
  const grouped = new Map<string, SocialDay[]>();

  for (const row of selected) {
    const key = `${row.date.slice(0, 7)}:${row.platform}`;
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  const base = [...grouped.entries()]
    .map(([key, monthRows]) => {
      const [month, platform] = key.split(":") as [string, Platform];
      const requiredDays = expectedDays(month);
      const complete = (metric: SocialMetric) =>
        monthRows.length === requiredDays && monthRows.every((row) => row[metric] !== null);
      const views = sumMetric(monthRows, "views");
      const interactions = sumMetric(monthRows, "interactions");
      const linkClicks = sumMetric(monthRows, "linkClicks");
      const follows = sumMetric(monthRows, "follows");

      return {
        month,
        platform,
        views,
        interactions,
        linkClicks,
        follows,
        interactionPerThousandViews:
          views === null || interactions === null ? null : safeDivide(interactions * 1_000, views),
        clicksPerThousandViews:
          views === null || linkClicks === null ? null : safeDivide(linkClicks * 1_000, views),
        followPerThousandViews:
          views === null || follows === null ? null : safeDivide(follows * 1_000, views),
        viewGrowth: null,
        interactionGrowth: null,
        complete: {
          views: complete("views"),
          interactions: complete("interactions"),
          linkClicks: complete("linkClicks"),
          follows: complete("follows"),
        },
      } satisfies MonthlySocialPerformance;
    })
    .sort((a, b) =>
      a.month.localeCompare(b.month) ||
      (["instagram", "facebook"] as Platform[]).indexOf(a.platform) -
        (["instagram", "facebook"] as Platform[]).indexOf(b.platform),
    );

  const byPlatform = new Map<Platform, MonthlySocialPerformance[]>();
  for (const row of base) byPlatform.set(row.platform, [...(byPlatform.get(row.platform) ?? []), row]);

  for (const platformRows of byPlatform.values()) {
    for (let index = 1; index < platformRows.length; index += 1) {
      const current = platformRows[index];
      const previous = platformRows[index - 1];
      const adjacent = dateToDay(monthBoundary(current.month, "start")) ===
        dateToDay(monthBoundary(previous.month, "end")) + 1;
      if (adjacent && current.complete.views && previous.complete.views) {
        current.viewGrowth = growth(current.views, previous.views);
      }
      if (adjacent && current.complete.interactions && previous.complete.interactions) {
        current.interactionGrowth = growth(current.interactions, previous.interactions);
      }
    }
  }

  return base;
}

function maxMonth(
  rows: MonthlySocialPerformance[],
  metric: "views" | "interactions",
): string | null {
  return rows
    .filter((row) => row[metric] !== null && row.complete[metric])
    .sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0))[0]?.month ?? null;
}

export function summarizeMarketingMomentum(
  rows: MonthlySocialPerformance[],
  platform: Platform,
): MarketingMomentum {
  const platformRows = rows.filter((row) => row.platform === platform).sort((a, b) => a.month.localeCompare(b.month));
  const latest = platformRows.at(-1);
  const previous = platformRows.at(-2);
  const latestFollowGrowth = latest && previous && latest.complete.follows && previous.complete.follows
    ? growth(latest.follows, previous.follows)
    : null;

  return {
    platform,
    latestMonth: latest?.month ?? null,
    strongestViewMonth: maxMonth(platformRows, "views"),
    strongestInteractionMonth: maxMonth(platformRows, "interactions"),
    latestViewGrowth: latest?.viewGrowth ?? null,
    latestInteractionGrowth: latest?.interactionGrowth ?? null,
    latestFollowGrowth,
  };
}

export function summarizeTikTokPostSignals(posts: TikTokPostSnapshot[]): TikTokPostSignal[] {
  return posts.map((post) => ({
    id: post.id,
    label: post.label,
    date: post.date,
    views: post.views,
    saveSharePerThousandViews: safeDivide((post.saves + post.shares) * 1_000, post.views),
    followersPerThousandViews: safeDivide(post.newFollowers * 1_000, post.views),
    averageRetentionRate: safeDivide(post.averageWatchSeconds, post.durationSeconds),
    completionRate: post.completionRate,
  }));
}

export function rankMetaContentOpportunities(rows: ContentItem[]): MetaContentOpportunity[] {
  return rows
    .filter((row): row is ContentItem & { views: number } => row.views !== null && row.views > 0)
    .map((row) => ({
      id: row.id,
      label: row.label,
      date: row.date,
      platform: row.platform,
      format: row.format,
      views: row.views,
      intentPerThousandViews:
        (((row.shares ?? 0) + (row.saves ?? 0) + (row.follows ?? 0)) * 1_000) / row.views,
      paidViewShare: row.paidViews === null ? null : row.paidViews / row.views,
    }))
    .sort((a, b) => b.intentPerThousandViews - a.intentPerThousandViews);
}
