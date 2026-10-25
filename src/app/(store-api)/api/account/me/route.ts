import { NextResponse, type NextRequest } from "next/server";
import { parseCustomerUpdate, toClientCustomer } from "@/lib/server/customer";
import { payloadClient } from "@/lib/server/payload";
import { readJson } from "@/lib/server/request";
import { clearSession, readSession } from "@/lib/server/session";

async function current(req: NextRequest) {
  const id = readSession(req);
  if (!id) return null;
  const payload = await payloadClient();
  return payload.findByID({ collection: "customers", id, depth: 0 }).catch(() => null);
}

function loggedOut() {
  const res = NextResponse.json({ error: "وارد نشدی." }, { status: 401 });
  clearSession(res);
  return res;
}

// The logged-in customer's profile, addresses and wishlist; phone is null
// for guests (not a 401, which browsers would log on every page load).
export async function GET(req: NextRequest) {
  const customer = await current(req);
  if (!customer) {
    const res = NextResponse.json({ phone: null });
    if (req.cookies.has("reyso_session")) clearSession(res);
    return res;
  }
  return NextResponse.json({ phone: customer.phone, customer: toClientCustomer(customer) });
}

export async function PATCH(req: NextRequest) {
  const customer = await current(req);
  if (!customer) return loggedOut();
  const payload = await payloadClient();
  const updated = await payload.update({
    collection: "customers",
    id: customer.id,
    data: parseCustomerUpdate(await readJson(req)),
  });
  return NextResponse.json({ phone: updated.phone, customer: toClientCustomer(updated) });
}
