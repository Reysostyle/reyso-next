import { REYSO_CONFIG } from "./config";

export const MOCK_OTP_FALLBACK = "12345"; // only used when VERIFY_OTP_URL is unset

/** Asks the SMS webhook to send a code. Failures are swallowed: the
 *  resend button on the code step gives the customer another try. */
export async function requestOtp(phone: string) {
  if (!REYSO_CONFIG.SEND_OTP_URL) return;
  try {
    await fetch(REYSO_CONFIG.SEND_OTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
  } catch {
    // ignore
  }
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (!REYSO_CONFIG.VERIFY_OTP_URL) return code === MOCK_OTP_FALLBACK;
  try {
    const res = await fetch(REYSO_CONFIG.VERIFY_OTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.verified;
  } catch {
    return false;
  }
}
