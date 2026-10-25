import { NextResponse, type NextRequest } from "next/server";
import { IRAN_MOBILE, sendOtp } from "@/lib/server/otp";
import { clientIp, readJson } from "@/lib/server/request";

// Step 1 of login: text a code to the number.
export async function POST(req: NextRequest) {
  const { phone } = await readJson(req);
  if (typeof phone !== "string" || !IRAN_MOBILE.test(phone)) {
    return NextResponse.json({ error: "شماره موبایل باید ۱۱ رقم باشه و با ۰۹ شروع بشه." }, { status: 400 });
  }
  const result = await sendOtp(phone, clientIp(req));
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, retryAfter: result.retryAfter },
      { status: result.status },
    );
  }
  return NextResponse.json({ ok: true });
}
