// Read from Meta Business Suite's rendered daily tables on 2026-09-15.
// Source window: 2026-08-18 through 2026-09-14, in source calendar order.
// Missing Instagram follow dates are null, not assumed zero.
export const socialUpdate = [
  {
    name: "Instagram",
    views: [
      1145, 654, 2663, 378, 868, 823, 573, 372, 456, 2636, 2162, 905, 1117,
      2310, 1828, 970, 664, 1234, 783, 2407, 1392, 2352, 3040, 754, 488, 418,
      553, 492,
    ],
    interactions: [
      24, 6, 103, 11, 19, 9, 5, 8, 5, 105, 31, 11, 4, 67, 49, 15, 7, 11, 5, 55,
      40, 58, 32, 5, 7, 11, 4, 4,
    ],
    clicks: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 3, 22, 12, 7, 3, 0, 0, 0,
      0, 0, 0, 0,
    ],
    follows: [
      2,
      2,
      2,
      2,
      2,
      2,
      null,
      3,
      2,
      2,
      8,
      null,
      2,
      6,
      4,
      2,
      1,
      2,
      2,
      4,
      1,
      3,
      6,
      3,
      3,
      null,
      1,
      null,
    ],
  },
  {
    name: "Facebook",
    views: [
      110, 21, 48, 58, 204, 90, 62, 45, 96, 194, 1215, 1403, 1455, 289, 276,
      132, 55, 226, 137, 200, 126, 286, 520, 168, 86, 169, 79, 104,
    ],
    interactions: [
      1, 2, 1, 1, 4, 4, 3, 1, 0, 5, 17, 6, 2, 3, 3, 0, 2, 3, 1, 4, 0, 3, 9, 1,
      1, 2, 3, 2,
    ],
    clicks: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0,
    ],
    follows: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
      0, 0, 0,
    ],
  },
];
export const socialUpdateSource =
  "https://business.facebook.com/latest/insights/results?asset_id=119648491125143";
