const META_SUFFIXES = [
  /(?:Carousel|Reel|Post)nobardalatBoostOpen Dropdown$/i,
  /(?:Carousel|Reel|Post)Crossposted$/i,
];

export function cleanContentLabel(rawLabel: string): string {
  let label = rawLabel.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  for (const suffix of META_SUFFIXES) label = label.replace(suffix, "").trim();
  if (!label || /^This post has no text$/i.test(label)) return "Bài đăng không có caption";
  return label;
}
