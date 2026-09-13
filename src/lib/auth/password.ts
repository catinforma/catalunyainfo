import "server-only";

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

/**
 * scrypt, from the Node standard library.
 *
 * No native dependency to build on Vercel, no third-party hashing package to
 * keep patched. Parameters follow the OWASP minimum for scrypt (N=2^16, r=8,
 * p=1); `maxmem` has to be raised explicitly because Node's default is below
 * what N=2^16 needs.
 */
const PARAMS = { N: 65536, r: 8, p: 1, maxmem: 128 * 65536 * 8 * 2 };
const KEY_LENGTH = 64;
const PREFIX = "scrypt";

export async function hashPassword(password: string): Promise<string> {
  assertStrength(password);
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, PARAMS);
  return [
    PREFIX,
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== PREFIX) return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  const salt = Buffer.from(parts[4] ?? "", "base64url");
  const expected = Buffer.from(parts[5] ?? "", "base64url");
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
    N,
    r,
    p,
    maxmem: 128 * N * r * 2,
  });

  // Constant-time: never leak how much of the hash matched.
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/**
 * Minimum viable policy: length over composition rules, which is what current
 * NIST guidance recommends. The CMS has a handful of accounts, all created by
 * an administrator, so this is a floor rather than a UX problem.
 */
export function assertStrength(password: string): void {
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters long.");
  }
  if (password.length > 200) {
    throw new Error("Password must be at most 200 characters long.");
  }
}
