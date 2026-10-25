"use client";

import { ACCOUNTS_API, adoptRemote, sendCode, verifyCode } from "./account";

export const MOCK_OTP_FALLBACK = "12345"; // GitHub Pages preview only (no server)

export type OtpResult = { ok: true } | { ok: false; error: string; retryAfter?: number };

/** Asks the server to text a login code to the number. */
export async function requestOtp(phone: string): Promise<OtpResult> {
  if (!ACCOUNTS_API) return { ok: true };
  const res = await sendCode(phone);
  return res.ok ? { ok: true } : { ok: false, error: res.error, retryAfter: res.retryAfter };
}

/** Checks the code; on success the server account is loaded into the
 *  browser (and created on first login). */
export async function verifyOtp(phone: string, code: string): Promise<OtpResult> {
  if (!ACCOUNTS_API) {
    return code === MOCK_OTP_FALLBACK ? { ok: true } : { ok: false, error: "" };
  }
  const res = await verifyCode(phone, code);
  if (!res.ok) return { ok: false, error: res.error };
  adoptRemote(res.data, true);
  return { ok: true };
}
