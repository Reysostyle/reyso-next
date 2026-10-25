import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";

// The customer's login lives in an httpOnly cookie holding their id and an
// expiry, signed with PAYLOAD_SECRET so it can't be forged or extended.
const COOKIE = "reyso_session";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

function sign(payload: string): string {
  return createHmac("sha256", process.env.PAYLOAD_SECRET || "")
    .update(payload)
    .digest("base64url");
}

export function setSession(req: NextRequest, res: NextResponse, customerId: number) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${customerId}.${expires}`;
  res.cookies.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearSession(res: NextResponse) {
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
}

/** The logged-in customer's id, or null. */
export function readSession(req: NextRequest): number | null {
  const [id, expires, sig] = req.cookies.get(COOKIE)?.value.split(".") ?? [];
  if (!id || !expires || !sig) return null;
  const expected = Buffer.from(sign(`${id}.${expires}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(expires) * 1000 < Date.now()) return null;
  return Number(id) || null;
}
