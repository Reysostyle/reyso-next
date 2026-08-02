import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "@fontsource/mirza/arabic-400.css";
import "@fontsource/mirza/arabic-500.css";
import "@fontsource/mirza/arabic-700.css";
import "@fontsource/mirza/latin-400.css";
import "@fontsource/mirza/latin-700.css";

// Self-hosted, per Design System v1.0: Google Fonts' CDN is unreliable from
// Iran, so the body typeface ships as a local file instead of next/font/google.
// Vazirmatn is bundled here (real variable font, verified working).
const vazirmatn = localFont({
  src: [{ path: "../fonts/Vazirmatn-Variable.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-vazirmatn",
  display: "swap",
});

// Display face: Mirza — a Nastaliq-inspired calligraphic Persian typeface,
// chosen for headlines specifically because it reads as distinctly Persian
// and handcrafted rather than a generic Arabic serif. Self-hosted via
// @fontsource (bundled npm package, no runtime Google Fonts CDN call).

export const metadata: Metadata = {
  title: "ReySo",
  description: "طراحی و دوخت لباس زنانه با الهام از ظرافت ایرانی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.variable}>
        {children}
      </body>
    </html>
  );
}
