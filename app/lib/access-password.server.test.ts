import assert from "node:assert/strict";
import { test } from "node:test";
import { hashAccessPassword, verifyAccessPasswordHash } from "./access-password.server";

test("Supabase password is salted and verifies only the correct input", async () => {
  const first = await hashAccessPassword("a-long-private-password");
  const second = await hashAccessPassword("a-long-private-password");
  assert.notEqual(first, second);
  assert.equal(await verifyAccessPasswordHash("a-long-private-password", first), true);
  assert.equal(await verifyAccessPasswordHash("wrong-password", first), false);
  assert.equal(await verifyAccessPasswordHash("a-long-private-password", "invalid"), false);
});
