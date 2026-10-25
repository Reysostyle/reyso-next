import { NextResponse, type NextRequest } from "next/server";
import { toClientCustomer } from "@/lib/server/customer";
import { checkOtp, IRAN_MOBILE } from "@/lib/server/otp";
import { payloadClient } from "@/lib/server/payload";
import { readJson } from "@/lib/server/request";
import { setSession } from "@/lib/server/session";

// Step 2 of login: check the code, create the account on first login and
// start the session.
export async function POST(req: NextRequest) {
  const { phone, code } = await readJson(req);
  if (typeof phone !== "string" || !IRAN_MOBILE.test(phone) || typeof code !== "string") {
    return NextResponse.json({ error: "اطلاعات ناقصه." }, { status: 400 });
  }

  const check = await checkOtp(phone, code);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 401 });

  const payload = await payloadClient();
  const lastLoginAt = new Date().toISOString();
  const existing = await payload.find({
    collection: "customers",
    where: { phone: { equals: phone } },
    limit: 1,
    depth: 0,
  });
  const customer = existing.docs[0]
    ? await payload.update({ collection: "customers", id: existing.docs[0].id, data: { lastLoginAt } })
    : await payload.create({ collection: "customers", data: { phone, lastLoginAt } });

  const res = NextResponse.json({ phone, customer: toClientCustomer(customer) });
  setSession(req, res, customer.id);
  return res;
}
