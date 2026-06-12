import { Header } from "@/components/Header";
import { StadiumBackground } from "@/components/StadiumBackground";
import { TelegramProvider } from "@/components/TelegramProvider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import type { Metadata, Viewport } from "next";
import { Bebas_Neue, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — FIFA World Cup 2026`,
  description: APP_TAGLINE,
};

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#06080d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${dmSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className="min-h-full bg-background antialiased">
        <TelegramProvider>
          <StadiumBackground>
            <Header />
            <main className="mx-auto min-h-[calc(100dvh-60px)] max-w-lg px-4 py-6">
              {children}
            </main>
          </StadiumBackground>
        </TelegramProvider>
      </body>
    </html>
  );
}
