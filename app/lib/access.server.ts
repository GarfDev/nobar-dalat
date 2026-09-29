import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createCookie, redirect } from "react-router";
import { createClient } from "@supabase/supabase-js";
import { verifyAccessPasswordHash } from "./access-password.server";

const COOKIE_NAME = "nobar_access";
const FALLBACK_PATH = "/insights";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 60;

type AccessCredential = {
  secret: string;
  tokenBasis: string;
  verify: (input: string) => Promise<boolean>;
};

let cachedPassword: { key: string; until: number; value: Promise<string | null> } | null = null;

async function supabasePassword(url: string, key: string) {
  const cacheKey = `${url}\0${key}`;
  if (cachedPassword?.key === cacheKey && cachedPassword.until > Date.now()) return cachedPassword.value;
  const value = (async () => {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const result = await db.from("private_access").select("password_hash").eq("id", 1).maybeSingle();
    if (result.error) throw new Error("Không đọc được mật khẩu từ Supabase.");
    return result.data?.password_hash ?? null;
  })();
  cachedPassword = { key: cacheKey, until: Date.now() + 30_000, value };
  try {
    return await value;
  } catch (error) {
    cachedPassword = null;
    throw error;
  }
}

async function credentials(): Promise<AccessCredential | null> {
  const url = process.env.SUPABASE_URL || process.env.VITE_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url || serviceKey) {
    if (!url || !serviceKey) return null;
    const passwordHash = await supabasePassword(url, serviceKey);
    if (!passwordHash) return null;
    const configuredSecret = process.env.ACCESS_SESSION_SECRET;
    const secret = configuredSecret && configuredSecret.length >= 32
      ? configuredSecret
      : createHmac("sha256", serviceKey).update("nobar-access-cookie-v1").digest("hex");
    return {
      secret,
      tokenBasis: passwordHash,
      verify: (input) => verifyAccessPasswordHash(input, passwordHash),
    };
  }

  const password = process.env.ACCESS_PASSWORD;
  const secret = process.env.ACCESS_SESSION_SECRET;
  if (!password || !secret || secret.length < 32) return null;
  return { secret, tokenBasis: password, verify: async (input) => equalStrings(input, password) };
}

function accessCookie(secret: string) {
  return createCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    secrets: [secret],
  });
}

function accessToken(password: string, secret: string) {
  return createHmac("sha256", secret).update(password).digest("hex");
}

function equalStrings(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export async function verifyPassword(input: string) {
  const configured = await credentials();
  return configured !== null && configured.verify(input);
}

export async function createAccessCookie() {
  const configured = await credentials();
  if (!configured) throw new Error("Access password is not configured");
  return accessCookie(configured.secret).serialize({
    token: accessToken(configured.tokenBasis, configured.secret),
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  });
}

export function safeReturnPath(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return FALLBACK_PATH;
  }

  try {
    const url = new URL(value, "https://local.invalid");
    if (
      url.origin !== "https://local.invalid" ||
      url.pathname.replace(/\/$/, "") === "/unlock"
    ) {
      return FALLBACK_PATH;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return FALLBACK_PATH;
  }
}

export async function checkAccess(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  if (["/", "/en", "/vi", "/unlock"].includes(pathname)) return null;

  let configured: AccessCredential | null = null;
  try {
    configured = await credentials();
  } catch {
    // If Supabase is unavailable, private routes remain locked.
  }
  if (configured) {
    try {
      const actual = await accessCookie(configured.secret).parse(
        request.headers.get("Cookie"),
      );
      const expected = accessToken(configured.tokenBasis, configured.secret);
      if (
        actual &&
        typeof actual === "object" &&
        typeof actual.token === "string" &&
        typeof actual.expiresAt === "number" &&
        actual.expiresAt > Date.now() &&
        equalStrings(actual.token, expected)
      )
        return null;
    } catch {
      // A malformed or expired cookie must not grant access.
    }
  }

  const destination = `${url.pathname}${url.search}`;
  return redirect(`/unlock?next=${encodeURIComponent(destination)}`);
}
