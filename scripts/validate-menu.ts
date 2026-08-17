import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

type Locale = {
  drinkMenu?: {
    categories?: Record<string, string>;
    items?: Record<
      string,
      { name?: string; ingredients?: string[]; tags?: string }
    >;
  };
};

const expected = {
  elo: ["lan-man", "loang-choang", "lon-xon"],
  dau: ["sac", "huyen", "khong", "hoi", "nga", "nang"],
  "old-fashioned": [
    "old-fashioned",
    "negroni",
    "margarita",
    "dry-martini",
    "espresso-martini",
    "daiquiri",
  ],
};

const readJson = async <T>(file: string): Promise<T> =>
  JSON.parse(await readFile(file, "utf8")) as T;

const root = process.cwd();
const menu = await readJson<{
  categories: Array<{ id: string; order: number }>;
  items: Array<{
    id: string;
    category: string;
    order: number;
    bgColor: string;
    accentColor: string;
    image: string;
    shape: string;
  }>;
}>(path.join(root, "app/data/menu.json"));

assert.deepEqual(
  [...menu.categories].sort((a, b) => a.order - b.order).map(({ id }) => id),
  Object.keys(expected),
  "menu categories or category order do not match the approved menu",
);

assert.equal(new Set(menu.items.map(({ id }) => id)).size, 15, "drink IDs must be unique");
assert.equal(menu.items.length, 15, "menu must contain exactly 15 drinks");

for (const [category, ids] of Object.entries(expected)) {
  const actual = menu.items
    .filter((item) => item.category === category)
    .sort((a, b) => a.order - b.order);

  assert.deepEqual(
    actual.map(({ id }) => id),
    ids,
    `${category} drinks or drink order do not match the approved menu`,
  );
  assert.equal(
    new Set(actual.map(({ order }) => order)).size,
    actual.length,
    `${category} contains duplicate order values`,
  );
}

for (const item of menu.items) {
  assert.ok(item.bgColor && item.accentColor && item.shape, `${item.id} is missing display styling`);
  assert.ok(item.image.startsWith("/"), `${item.id} must use an absolute public image path`);
  await access(path.join(root, "public", item.image));
}

for (const language of ["en", "vi"]) {
  const locale = await readJson<Locale>(
    path.join(root, `public/locales/${language}/translation.json`),
  );
  const categories = locale.drinkMenu?.categories ?? {};
  const items = locale.drinkMenu?.items ?? {};

  for (const category of Object.keys(expected)) {
    assert.ok(categories[category]?.trim(), `${language} is missing category ${category}`);
  }
  for (const { id } of menu.items) {
    const copy = items[id];
    assert.ok(copy?.name?.trim(), `${language} is missing ${id}.name`);
    assert.ok(copy?.ingredients?.length, `${language} is missing ${id}.ingredients`);
    assert.ok(copy?.ingredients?.every((ingredient) => ingredient.trim()), `${language} has an empty ingredient for ${id}`);
    assert.ok(copy?.tags?.trim(), `${language} is missing ${id}.tags`);
  }
}

console.log("Menu validation passed: 3 categories, 15 drinks, images and translations present.");
