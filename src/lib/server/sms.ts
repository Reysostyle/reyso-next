import "server-only";
import { kavenegarLookup } from "./kavenegar";

// How login codes reach the customer:
// - "kavenegar": real SMS through Kavenegar's verify/lookup API, once
//   KAVENEGAR_API_KEY and KAVENEGAR_OTP_TEMPLATE are set;
// - "demo": nothing is sent and the code is always 12345 (SMS_DEMO=1, for
//   trying the site before the SMS panel is ready);
// - "off": login is refused rather than letting anyone in with 12345.
export type SmsMode = "kavenegar" | "demo" | "off";

export const DEMO_CODE = "12345";

export function smsMode(): SmsMode {
  if (process.env.KAVENEGAR_API_KEY && process.env.KAVENEGAR_OTP_TEMPLATE) return "kavenegar";
  if (process.env.SMS_DEMO === "1") return "demo";
  return "off";
}

export async function sendOtpSms(phone: string, code: string): Promise<boolean> {
  const mode = smsMode();
  if (mode === "demo") return true;
  if (mode === "off") return false;
  const res = await kavenegarLookup(phone, process.env.KAVENEGAR_OTP_TEMPLATE!, { token: code });
  return res.ok;
}
