import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const HASH_BYTES = 64;
const SALT_BYTES = 16;

export async function hashAccessPassword(password: string) {
  const salt = randomBytes(SALT_BYTES);
  const hash = (await scrypt(password, salt, HASH_BYTES)) as Buffer;
  return `scrypt:v1:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyAccessPasswordHash(password: string, stored: string) {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "scrypt" || parts[1] !== "v1" || !/^[0-9a-f]{32}$/i.test(parts[2]) || !/^[0-9a-f]{128}$/i.test(parts[3])) {
    return false;
  }
  const expected = Buffer.from(parts[3], "hex");
  const actual = (await scrypt(password, Buffer.from(parts[2], "hex"), expected.length)) as Buffer;
  return timingSafeEqual(actual, expected);
}
