// Backend endpoints and contact handles. These used to be hard-coded in
// js/config.js and pointed at an n8n instance on localhost, which no
// customer could reach. They now come from environment variables; an
// empty value keeps the same mock behaviour the old site had.
export const REYSO_CONFIG = {
  ORDER_API_URL: process.env.NEXT_PUBLIC_ORDER_API_URL ?? "",
  TRACK_LOOKUP_URL: process.env.NEXT_PUBLIC_TRACK_LOOKUP_URL ?? "",
  SEND_OTP_URL: process.env.NEXT_PUBLIC_SEND_OTP_URL ?? "",
  VERIFY_OTP_URL: process.env.NEXT_PUBLIC_VERIFY_OTP_URL ?? "",
  SUPPORT_CHAT_URL: process.env.NEXT_PUBLIC_SUPPORT_CHAT_URL ?? "",
  TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? "",
  WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  TELEGRAM_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? "",
};

export const INSTAGRAM_URL = "https://instagram.com/reyso.style";

export function contactLinks() {
  return {
    whatsapp: REYSO_CONFIG.WHATSAPP_NUMBER ? "https://wa.me/" + REYSO_CONFIG.WHATSAPP_NUMBER : "#",
    telegram: REYSO_CONFIG.TELEGRAM_USERNAME ? "https://t.me/" + REYSO_CONFIG.TELEGRAM_USERNAME : "#",
  };
}
