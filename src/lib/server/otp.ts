import "server-only";
import { createHash, randomInt, timingSafeEqual } from "crypto";
import { payloadClient } from "./payload";
import { DEMO_CODE, sendOtpSms, smsMode } from "./sms";

const CODE_TTL_MS = 5 * 60_000;
const RESEND_AFTER_MS = 60_000;
const MAX_PER_PHONE_PER_HOUR = 5;
const MAX_PER_IP_PER_HOUR = 20;
const MAX_ATTEMPTS = 5;
const HOUR = 60 * 60_000;

export const IRAN_MOBILE = /^09\d{9}$/;

const hash = (phone: string, code: string) =>
  createHash("sha256")
    .update(`${phone}:${code}:${process.env.PAYLOAD_SECRET || ""}`)
    .digest("hex");

export type SendResult =
  { ok: true; demo: boolean } | { ok: false; status: number; error: string; retryAfter?: number };

export async function sendOtp(phone: string, ip: string): Promise<SendResult> {
  const mode = smsMode();
  if (mode === "off") {
    return { ok: false, status: 503, error: "ارسال پیامک هنوز راه‌اندازی نشده. کمی بعد دوباره امتحان کن." };
  }

  const payload = await payloadClient();
  const since = new Date(Date.now() - HOUR).toISOString();

  const recent = await payload.find({
    collection: "otp-codes",
    where: { phone: { equals: phone }, createdAt: { greater_than: since } },
    sort: "-createdAt",
    limit: MAX_PER_PHONE_PER_HOUR,
    depth: 0,
  });
  // A code that's already been used doesn't hold up a new one (logging
  // out and straight back in).
  const last = recent.docs[0];
  if (last && !last.used) {
    const wait = Date.parse(last.createdAt) + RESEND_AFTER_MS - Date.now();
    if (wait > 0) {
      return {
        ok: false,
        status: 429,
        error: "کد قبلی تازه فرستاده شده. یک دقیقه صبر کن.",
        retryAfter: Math.ceil(wait / 1000),
      };
    }
  }
  if (recent.totalDocs >= MAX_PER_PHONE_PER_HOUR) {
    return { ok: false, status: 429, error: "تعداد درخواست‌ها زیاد بوده. یک ساعت دیگه دوباره امتحان کن." };
  }
  const fromIp = await payload.count({
    collection: "otp-codes",
    where: { ip: { equals: ip }, createdAt: { greater_than: since } },
  });
  if (fromIp.totalDocs >= MAX_PER_IP_PER_HOUR) {
    return { ok: false, status: 429, error: "تعداد درخواست‌ها زیاد بوده. یک ساعت دیگه دوباره امتحان کن." };
  }

  const code = mode === "demo" ? DEMO_CODE : String(randomInt(10000, 100000));
  if (!(await sendOtpSms(phone, code))) {
    return { ok: false, status: 502, error: "ارسال پیامک انجام نشد. چند لحظه دیگه دوباره امتحان کن." };
  }

  // Codes still waiting for this number stop working once a new one is sent.
  await payload.update({
    collection: "otp-codes",
    where: { phone: { equals: phone }, used: { equals: false } },
    data: { used: true },
  });
  await payload.create({
    collection: "otp-codes",
    data: {
      phone,
      ip,
      codeHash: hash(phone, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS).toISOString(),
    },
  });
  // Old rows are only needed for the hourly limits.
  await payload.delete({
    collection: "otp-codes",
    where: { createdAt: { less_than: new Date(Date.now() - 24 * HOUR).toISOString() } },
  });

  return { ok: true, demo: mode === "demo" };
}

export type VerifyResult = { ok: true } | { ok: false; error: string };

export async function checkOtp(phone: string, code: string): Promise<VerifyResult> {
  const payload = await payloadClient();
  const { docs } = await payload.find({
    collection: "otp-codes",
    where: { phone: { equals: phone }, used: { equals: false } },
    sort: "-createdAt",
    limit: 1,
    depth: 0,
  });
  const row = docs[0];
  if (!row || Date.parse(row.expiresAt) < Date.now()) {
    return { ok: false, error: "کد منقضی شده. یک کد جدید بگیر." };
  }
  if ((row.attempts ?? 0) >= MAX_ATTEMPTS) {
    return { ok: false, error: "تعداد تلاش‌ها زیاد بوده. یک کد جدید بگیر." };
  }

  const expected = Buffer.from(row.codeHash);
  const given = Buffer.from(hash(phone, code));
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    await payload.update({
      collection: "otp-codes",
      id: row.id,
      data: { attempts: (row.attempts ?? 0) + 1 },
    });
    return { ok: false, error: "کد وارد‌شده درست نیست. دوباره امتحان کن." };
  }

  await payload.update({ collection: "otp-codes", id: row.id, data: { used: true } });
  return { ok: true };
}
