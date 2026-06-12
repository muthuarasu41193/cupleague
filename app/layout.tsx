import { Header } from "@/components/Header";
import { TelegramProvider } from "@/components/TelegramProvider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — FIFA 2026 Private Leagues`,
  description: APP_TAGLINE,
};

/** Supabase auth requires dynamic rendering (no static prerender without env) */
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0f0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <head>
        {/* Telegram Mini App SDK — enables WebApp detection & haptics */}
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="min-h-full bg-pitch-black antialiased">
        <TelegramProvider>
          <Header />
          <main className="mx-auto min-h-[calc(100dvh-57px)] max-w-lg px-4 py-6">
            {children}
          </main>
        </TelegramProvider>
      </body>
    </html>
  );
}
