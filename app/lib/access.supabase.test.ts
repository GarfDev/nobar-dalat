import assert from "node:assert/strict";
import { test } from "node:test";
import { hashAccessPassword } from "./access-password.server";
import { checkAccess, createAccessCookie, verifyPassword } from "./access.server";

test("Supabase owns the password and rotating it revokes earlier sessions", async () => {
  const original = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    password: process.env.ACCESS_PASSWORD,
    secret: process.env.ACCESS_SESSION_SECRET,
    fetch: globalThis.fetch,
    now: Date.now,
  };
  let stored = await hashAccessPassword("first-private-password");
  let requests = 0;
  try {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "sb_secret_test-server-key";
    process.env.ACCESS_PASSWORD = "old-environment-password";
    delete process.env.ACCESS_SESSION_SECRET;
    globalThis.fetch = async (input) => {
      assert.match(String(input), /\/rest\/v1\/private_access/);
      requests += 1;
      return new Response(JSON.stringify({ password_hash: stored }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    assert.equal(await verifyPassword("old-environment-password"), false);
    assert.equal(await verifyPassword("first-private-password"), true);
    const cookie = await createAccessCookie();
    const request = new Request("https://example.com/expenses", {
      headers: { Cookie: cookie.split(";")[0] },
    });
    assert.equal(await checkAccess(request), null);
    assert.equal(requests, 1);

    stored = await hashAccessPassword("second-private-password");
    Date.now = () => original.now() + 31_000;
    assert.equal((await checkAccess(request))?.status, 302);
    assert.equal(await verifyPassword("second-private-password"), true);
  } finally {
    globalThis.fetch = original.fetch;
    Date.now = original.now;
    for (const [name, value] of [
      ["SUPABASE_URL", original.url],
      ["SUPABASE_SERVICE_ROLE_KEY", original.key],
      ["ACCESS_PASSWORD", original.password],
      ["ACCESS_SESSION_SECRET", original.secret],
    ] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
