import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  checkAccess,
  createAccessCookie,
  safeReturnPath,
  verifyPassword,
} from "./access.server";

const originalPassword = process.env.ACCESS_PASSWORD;
const originalSecret = process.env.ACCESS_SESSION_SECRET;

before(() => {
  process.env.ACCESS_PASSWORD = "test-password";
  process.env.ACCESS_SESSION_SECRET = "test-secret-with-at-least-32-characters";
});

after(() => {
  if (originalPassword === undefined) delete process.env.ACCESS_PASSWORD;
  else process.env.ACCESS_PASSWORD = originalPassword;
  if (originalSecret === undefined) delete process.env.ACCESS_SESSION_SECRET;
  else process.env.ACCESS_SESSION_SECRET = originalSecret;
});

test("homepage and sign-in remain public", async () => {
  for (const path of ["/", "/en", "/vi", "/unlock"]) {
    const result = await checkAccess(new Request(`https://example.com${path}`));
    assert.equal(result, null, path);
  }
});

test("private routes redirect to sign-in and preserve the destination", async () => {
  for (const path of [
    "/insights",
    "/insights/finance?month=8",
    "/design/menu/originals",
  ]) {
    const result = await checkAccess(new Request(`https://example.com${path}`));
    assert.ok(result instanceof Response);
    assert.equal(result.status, 302);
    assert.equal(
      result.headers.get("Location"),
      `/unlock?next=${encodeURIComponent(path)}`,
    );
  }
});

test("correct password opens private routes through a signed cookie", async () => {
  assert.equal(await verifyPassword("wrong"), false);
  assert.equal(await verifyPassword("test-password"), true);
  const cookie = await createAccessCookie();
  assert.match(cookie, /HttpOnly/i);
  const request = new Request("https://example.com/insights", {
    headers: { Cookie: cookie.split(";")[0] },
  });
  assert.equal(await checkAccess(request), null);
});

test("missing configuration or invalid cookie never opens a private route", async () => {
  const forged = new Request("https://example.com/insights", {
    headers: { Cookie: "nobar_access=1" },
  });
  assert.equal((await checkAccess(forged))?.status, 302);
  delete process.env.ACCESS_SESSION_SECRET;
  assert.equal(await verifyPassword("test-password"), false);
  assert.equal((await checkAccess(forged))?.status, 302);
  process.env.ACCESS_SESSION_SECRET = "test-secret-with-at-least-32-characters";
});

test("a session remains valid through day 59 and expires after day 60", async () => {
  const cookie = await createAccessCookie();
  assert.match(cookie, /Max-Age=5184000/i);
  const request = new Request("https://example.com/insights", {
    headers: { Cookie: cookie.split(";")[0] },
  });
  const originalNow = Date.now;
  try {
    Date.now = () => originalNow() + 59 * 24 * 60 * 60 * 1000;
    assert.equal(await checkAccess(request), null);
    Date.now = () => originalNow() + 61 * 24 * 60 * 60 * 1000;
    assert.equal((await checkAccess(request))?.status, 302);
  } finally {
    Date.now = originalNow;
  }
});

test("return path cannot redirect outside this site or back to sign-in", () => {
  assert.equal(
    safeReturnPath("/insights/finance?month=8"),
    "/insights/finance?month=8",
  );
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/unlock",
    "javascript:alert(1)",
  ]) {
    assert.equal(safeReturnPath(value), "/insights");
  }
});
