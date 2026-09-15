import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMonthlySocialPerformance,
  rankMetaContentOpportunities,
  summarizeMarketingMomentum,
  summarizeTikTokPostSignals,
} from "./marketing-analysis";
import type { ContentItem, ISODate, SocialDay, TikTokPostSnapshot } from "./types";

function socialDay(
  date: ISODate,
  platform: "instagram" | "facebook",
  values: Partial<Omit<SocialDay, "date" | "platform" | "audienceLabel">>,
): SocialDay {
  return {
    date,
    platform,
    views: null,
    audience: null,
    audienceLabel: platform === "instagram" ? "reach" : "viewers",
    interactions: null,
    visits: null,
    linkClicks: null,
    follows: null,
    ...values,
  };
}

test("aggregates monthly social signals without treating partial months as complete", () => {
  const rows: SocialDay[] = [
    socialDay("2026-01-30", "instagram", { views: 100, interactions: 10, linkClicks: 2, follows: 1 }),
    socialDay("2026-01-31", "instagram", { views: 100, interactions: 20, linkClicks: 4, follows: 3 }),
    socialDay("2026-02-01", "instagram", { views: 150, interactions: 30, linkClicks: 3, follows: 2 }),
    socialDay("2026-02-02", "instagram", { views: 250, interactions: 50, linkClicks: 5, follows: 4 }),
    socialDay("2026-01-30", "facebook", { views: 50, interactions: 5, linkClicks: 1, follows: 0 }),
    socialDay("2026-01-31", "facebook", { views: 50, interactions: 5, linkClicks: 1, follows: 1 }),
    socialDay("2026-02-01", "facebook", { views: 100, interactions: 8, linkClicks: 2, follows: 1 }),
    socialDay("2026-02-02", "facebook", { views: 100, interactions: 12, linkClicks: 2, follows: 1 }),
  ];

  const result = buildMonthlySocialPerformance(rows, {
    start: "2026-01-30",
    end: "2026-02-02",
  });

  assert.equal(result.length, 4);
  assert.deepEqual(result[0], {
    month: "2026-01",
    platform: "instagram",
    views: 200,
    interactions: 30,
    linkClicks: 6,
    follows: 4,
    interactionPerThousandViews: 150,
    clicksPerThousandViews: 30,
    followPerThousandViews: 20,
    viewGrowth: null,
    interactionGrowth: null,
    complete: { views: false, interactions: false, linkClicks: false, follows: false },
  });
  assert.equal(result[2].month, "2026-02");
  assert.equal(result[2].platform, "instagram");
  assert.equal(result[2].views, 400);
  assert.equal(result[2].viewGrowth, null);
  assert.equal(result[2].interactionGrowth, null);
});

test("does not label a rise as growth when the previous month has missing source days", () => {
  const rows: SocialDay[] = [
    socialDay("2026-01-31", "facebook", { views: 100, interactions: 10 }),
  ];
  for (let day = 1; day <= 28; day += 1) {
    rows.push(socialDay(`2026-02-${String(day).padStart(2, "0")}` as ISODate, "facebook", {
      views: 10,
      interactions: 1,
    }));
  }

  const result = buildMonthlySocialPerformance(rows, {
    start: "2026-01-30",
    end: "2026-02-28",
  });

  const january = result.find((item) => item.month === "2026-01");
  const february = result.find((item) => item.month === "2026-02");
  assert.equal(january?.complete.views, false);
  assert.equal(february?.complete.views, true);
  assert.equal(february?.viewGrowth, null);
});

test("does not call a partial calendar month monthly growth", () => {
  const rows: SocialDay[] = [
    socialDay("2026-01-30", "instagram", { views: 100, interactions: 10 }),
    socialDay("2026-01-31", "instagram", { views: 100, interactions: 10 }),
    socialDay("2026-02-01", "instagram", { views: 300, interactions: 30 }),
    socialDay("2026-02-02", "instagram", { views: 300, interactions: 30 }),
  ];

  const result = buildMonthlySocialPerformance(rows, {
    start: "2026-01-30",
    end: "2026-02-02",
  });

  const january = result.find((item) => item.month === "2026-01");
  const february = result.find((item) => item.month === "2026-02");
  assert.equal(january?.complete.views, false);
  assert.equal(february?.complete.views, false);
  assert.equal(february?.viewGrowth, null);
  assert.equal(summarizeMarketingMomentum(result, "instagram").strongestViewMonth, null);
});

test("turns monthly rows into plain-language momentum without inventing missing follower growth", () => {
  const rows: SocialDay[] = [];
  for (const [month, days, views, interactions, linkClicks] of [
    ["2026-01", 31, 100, 10, 1],
    ["2026-02", 28, 180, 9, 4],
  ] as const) {
    for (let day = 1; day <= days; day += 1) {
      rows.push(socialDay(`${month}-${String(day).padStart(2, "0")}` as ISODate, "instagram", {
        views: day === 1 ? views : 0,
        interactions: day === 1 ? interactions : 0,
        linkClicks: day === 1 ? linkClicks : 0,
        follows: null,
      }));
    }
  }
  const months = buildMonthlySocialPerformance(rows, {
    start: "2026-01-01",
    end: "2026-02-28",
  });

  assert.deepEqual(summarizeMarketingMomentum(months, "instagram"), {
    platform: "instagram",
    latestMonth: "2026-02",
    strongestViewMonth: "2026-02",
    strongestInteractionMonth: "2026-01",
    latestViewGrowth: 0.8,
    latestInteractionGrowth: -0.1,
    latestFollowGrowth: null,
  });
});

test("normalizes TikTok saves, shares and follows per thousand views", () => {
  const post: TikTokPostSnapshot = {
    id: "video-1",
    date: "2026-05-30",
    label: "NObar Đà Lạt",
    durationSeconds: 20,
    views: 20_000,
    viewsApproximate: true,
    likes: 1_000,
    comments: 20,
    shares: 300,
    saves: 500,
    averageWatchSeconds: 5,
    completionRate: 0.08,
    newFollowers: 40,
  };

  assert.deepEqual(summarizeTikTokPostSignals([post])[0], {
    id: "video-1",
    label: "NObar Đà Lạt",
    date: "2026-05-30",
    views: 20_000,
    saveSharePerThousandViews: 40,
    followersPerThousandViews: 2,
    averageRetentionRate: 0.25,
    completionRate: 0.08,
  });
});

test("ranks Meta content by saves, shares and follows instead of raw views", () => {
  const common = {
    date: "2026-01-08" as ISODate,
    platform: "instagram" as const,
    format: "reel" as const,
    audience: null,
    interactions: 100,
    likes: 50,
    comments: 2,
    averageWatchSeconds: null,
  };
  const rows: ContentItem[] = [
    { ...common, id: "many-views", label: "Nhiều view", views: 20_000, shares: 20, saves: 20, follows: 10, paidViews: 18_000 },
    { ...common, id: "high-intent", label: "Nhiều ý định", views: 5_000, shares: 25, saves: 50, follows: 25, paidViews: null },
  ];

  assert.deepEqual(rankMetaContentOpportunities(rows), [
    {
      id: "high-intent",
      label: "Nhiều ý định",
      date: "2026-01-08",
      platform: "instagram",
      format: "reel",
      views: 5_000,
      intentPerThousandViews: 20,
      paidViewShare: null,
    },
    {
      id: "many-views",
      label: "Nhiều view",
      date: "2026-01-08",
      platform: "instagram",
      format: "reel",
      views: 20_000,
      intentPerThousandViews: 2.5,
      paidViewShare: 0.9,
    },
  ]);
});
