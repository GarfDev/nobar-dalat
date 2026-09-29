import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { after, before, test } from "node:test";

const origin = "http://127.0.0.1:5198";
let server: ChildProcess;
let output = "";

before(async () => {
  server = spawn(
    "./node_modules/.bin/react-router",
    ["dev", "--host", "127.0.0.1", "--port", "5198"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ACCESS_PASSWORD: "integration-password",
        ACCESS_SESSION_SECRET: "integration-secret-with-at-least-32-characters",
        SUPABASE_URL: "",
        VITE_PUBLIC_SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout?.on("data", (chunk) => {
    output += chunk.toString();
  });
  server.stderr?.on("data", (chunk) => {
    output += chunk.toString();
  });
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited: ${output}`);
    try {
      await fetch(origin, { redirect: "manual" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Server did not start: ${output}`);
});

after(() => server?.kill());

test("homepage remains public", async () => {
  for (const path of ["/", "/en", "/vi"]) {
    const response = await fetch(`${origin}${path}`, { redirect: "manual" });
    assert.notEqual(response.status, 401, path);
    assert.notEqual(
      response.headers.get("Location")?.startsWith("/unlock"),
      true,
      path,
    );
  }
});

test("private pages require a password even on a direct request", async () => {
  const response = await fetch(`${origin}/insights/finance?month=8`, {
    redirect: "manual",
  });
  assert.equal(response.status, 302);
  assert.equal(
    response.headers.get("Location"),
    "/unlock?next=%2Finsights%2Ffinance%3Fmonth%3D8",
  );
});

test("sign-in grants access and returns to the requested page", async () => {
  const wrong = await fetch(`${origin}/unlock`, {
    method: "POST",
    body: new URLSearchParams({ password: "wrong", next: "/insights" }),
    redirect: "manual",
  });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.headers.get("Set-Cookie"), null);

  const correct = await fetch(`${origin}/unlock`, {
    method: "POST",
    body: new URLSearchParams({
      password: "integration-password",
      next: "/insights/finance",
    }),
    redirect: "manual",
  });
  assert.equal(correct.status, 302);
  assert.equal(correct.headers.get("Location"), "/insights/finance");
  const cookie = correct.headers.get("Set-Cookie");
  assert.ok(cookie);
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Max-Age=5184000/i);
  const page = await fetch(`${origin}/insights/finance`, {
    headers: { Cookie: cookie.split(";")[0] },
    redirect: "manual",
  });
  assert.equal(page.status, 200);
});
