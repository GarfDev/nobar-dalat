import assert from "node:assert/strict";
import test from "node:test";

import { cleanContentLabel } from "./content-label";

test("replaces Meta interface debris when a post has no caption", () => {
  assert.equal(
    cleanContentLabel("This post has no textCarouselnobardalatBoostOpen Dropdown​"),
    "Bài đăng không có caption",
  );
});

test("keeps the real caption and removes appended Meta controls", () => {
  assert.equal(
    cleanContentLabel("đà lạt lạnh 14 độ, nếu bạn cần nơi trú ấm thì ghé NOBAR chơi nha ^^ReelnobardalatBoostOpen Dropdown​"),
    "đà lạt lạnh 14 độ, nếu bạn cần nơi trú ấm thì ghé NOBAR chơi nha ^^",
  );
});

test("removes crosspost metadata without deleting account mentions in the caption", () => {
  assert.equal(
    cleanContentLabel("rượu vào, lời ra.\n@nobardalat\n#dalatReelCrossposted"),
    "rượu vào, lời ra.\n@nobardalat\n#dalat",
  );
});
