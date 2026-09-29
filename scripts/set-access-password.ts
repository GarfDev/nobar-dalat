import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { hashAccessPassword } from "../app/lib/access-password.server";

if (existsSync(".env")) process.loadEnvFile(".env");

const url = process.env.SUPABASE_URL || process.env.VITE_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Cần SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY trong .env hoặc môi trường máy chủ.");
}

let supplied = "";
if (!process.stdin.isTTY) {
  for await (const chunk of process.stdin) supplied += String(chunk);
  supplied = supplied.trim();
}
const password = supplied || randomBytes(18).toString("base64url");
if (password.length < 12) throw new Error("Mật khẩu cần ít nhất 12 ký tự.");

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const result = await db.from("private_access").upsert({
  id: 1,
  password_hash: await hashAccessPassword(password),
  updated_at: new Date().toISOString(),
}, { onConflict: "id" });
if (result.error) throw new Error(`Không lưu được mật khẩu vào Supabase: ${result.error.message}`);

console.log("Đã lưu mã băm mật khẩu vào Supabase. Mật khẩu đăng nhập:");
console.log(password);
console.log("Hãy lưu mật khẩu này ở nơi riêng tư; chạy lại lệnh sẽ đổi mật khẩu và đăng xuất các thiết bị cũ.");
