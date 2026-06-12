"use client";

import { Button } from "@/components/Button";
import {
  APP_NAME,
  EXAMPLE_LEAGUES,
  FREE_LEAGUE_LIMIT,
  HERO_SUBTITLE,
  HERO_TITLE,
  PREMIUM_PRICE_INR,
  TELEGRAM_BOT_URL,
} from "@/lib/constants";
import { hapticTap } from "@/utils/haptic";
import { isTelegramMiniApp } from "@/utils/telegram";
import { Crown, Send, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Landing page — hero, create/join CTAs, pricing, example leagues.
 */
export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [inTelegram, setInTelegram] = useState(false);

  useEffect(() => {
    setInTelegram(isTelegramMiniApp());
  }, []);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length === 6) {
      hapticTap();
      router.push(`/${code}`);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <section className="pitch-pattern -mx-4 rounded-3xl bg-gradient-to-b from-pitch-green/10 to-transparent px-4 py-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pitch-gold/30 bg-pitch-gold/10 px-4 py-1.5 text-sm font-semibold text-pitch-gold">
          <Trophy className="h-4 w-4" />
          FIFA 2026
        </div>

        <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
          {HERO_TITLE}
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-lg text-pitch-muted-text">
          {HERO_SUBTITLE}
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/create">
            <Button variant="gold">Create League ⚽</Button>
          </Link>

          {/* Join with code */}
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Join with Code"
              className="min-h-14 flex-1 rounded-2xl border border-pitch-border bg-pitch-card px-4 text-center font-mono text-xl font-bold uppercase tracking-widest text-white placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-pitch-muted-text focus:border-pitch-green focus:outline-none focus:ring-2 focus:ring-pitch-green/30"
            />
            <button
              type="submit"
              disabled={joinCode.length !== 6}
              className="min-h-14 rounded-2xl bg-pitch-green px-5 font-semibold text-white transition active:scale-95 disabled:opacity-40"
            >
              Go
            </button>
          </form>
        </div>

        {/* Telegram button — prominent on web, hidden in mini app */}
        {!inTelegram && (
          <a
            href={TELEGRAM_BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => hapticTap()}
            className="mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#0088cc] bg-[#0088cc]/10 text-lg font-semibold text-[#0088cc] transition active:scale-[0.98]"
          >
            <Send className="h-5 w-5" />
            Open in Telegram
          </a>
        )}
      </section>

      {/* Pricing */}
      <section className="rounded-2xl border border-pitch-border bg-pitch-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
          <Crown className="h-5 w-5 text-pitch-gold" />
          Simple Pricing
        </h2>
        <div className="grid gap-3">
          <div className="flex items-center justify-between rounded-xl bg-pitch-black p-4">
            <div>
              <p className="font-semibold text-white">Free</p>
              <p className="text-sm text-pitch-muted-text">
                {FREE_LEAGUE_LIMIT} private league
              </p>
            </div>
            <span className="text-2xl font-black text-pitch-green">₹0</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-pitch-gold/30 bg-pitch-gold/5 p-4">
            <div>
              <p className="font-semibold text-pitch-gold">Premium</p>
              <p className="text-sm text-pitch-muted-text">
                Unlimited leagues + themes · full FIFA 2026
              </p>
            </div>
            <span className="text-2xl font-black text-pitch-gold">
              ₹{PREMIUM_PRICE_INR}
              <span className="text-sm font-normal text-pitch-muted-text">
                {" "}
                once
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Example leagues */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">
          Popular Leagues 🌍
        </h2>
        <div className="flex flex-col gap-3">
          {EXAMPLE_LEAGUES.map((league) => (
            <div
              key={league.name}
              className="flex items-center gap-4 rounded-2xl border border-pitch-border bg-pitch-card p-4"
            >
              <span className="text-3xl">{league.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-white">{league.name}</p>
                <p className="text-sm text-pitch-muted-text">
                  {league.description}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-pitch-muted-text">
                <Users className="h-4 w-4" />
                {league.members}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="pb-8 text-center text-sm text-pitch-muted-text">
        {APP_NAME} · Predict. Compete. Celebrate. 🏆
      </p>
    </div>
  );
}
