"use client";

import { Button } from "@/components/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  APP_NAME,
  EXAMPLE_LEAGUES,
  FREE_LEAGUE_LIMIT,
  HERO_SUBTITLE,
  HERO_TITLE,
  PREMIUM_PRICE_INR,
  TELEGRAM_BOT_URL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { hapticTap } from "@/utils/haptic";
import { isTelegramMiniApp } from "@/utils/telegram";
import {
  ArrowRight,
  Crown,
  Hash,
  Send,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
    <div className="flex flex-col gap-10 pb-10">
      {/* Hero — broadcast-style */}
      <section className="animate-fade-up relative -mx-4 overflow-hidden rounded-3xl px-5 pb-8 pt-10">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-pitch/12 via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/5 blur-3xl"
        />

        <div className="relative text-center">
          <Badge variant="host" className="mb-5">
            USA · MEX · CAN 2026
          </Badge>

          <p className="font-display text-sm tracking-[0.35em] text-pitch-light">
            FIFA WORLD CUP
          </p>
          <h1 className="font-display mt-1 text-[2.75rem] leading-[0.95] tracking-wide text-foreground sm:text-6xl">
            {HERO_TITLE.toUpperCase()}
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
            {HERO_SUBTITLE}
          </p>

          {/* Quick stats */}
          <div className="mt-6 flex justify-center gap-6">
            {[
              { icon: Trophy, label: "Private pools" },
              { icon: Zap, label: "Live scoring" },
              { icon: Users, label: "Friends only" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="h-4 w-4 text-gold" strokeWidth={2} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/create">
              <Button variant="gold" className="group">
                Create Your League
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </Link>

            <form onSubmit={handleJoin} className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="INVITE CODE"
                  className={cn(
                    "h-14 w-full rounded-2xl border border-border bg-surface pl-10 pr-4",
                    "font-mono text-lg font-bold tracking-[0.25em] text-foreground uppercase",
                    "placeholder:font-sans placeholder:text-sm placeholder:font-semibold placeholder:tracking-normal placeholder:text-muted-foreground/50",
                    "focus:border-pitch focus:outline-none focus:ring-2 focus:ring-pitch/20"
                  )}
                />
              </div>
              <button
                type="submit"
                disabled={joinCode.length !== 6}
                className={cn(
                  "flex h-14 min-w-[72px] items-center justify-center rounded-2xl",
                  "bg-pitch font-semibold text-white transition active:scale-95",
                  "disabled:opacity-35"
                )}
              >
                Join
              </button>
            </form>
          </div>

          {!inTelegram && (
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => hapticTap()}
              className={cn(
                "mt-4 flex h-12 items-center justify-center gap-2 rounded-xl",
                "border border-[#29a8e0]/30 bg-[#29a8e0]/8 text-sm font-semibold text-[#5bc4f0]",
                "transition hover:bg-[#29a8e0]/15 active:scale-[0.98]"
              )}
            >
              <Send className="h-4 w-4" />
              Open in Telegram
            </a>
          )}
        </div>
      </section>

      {/* Pricing */}
      <section className="animate-fade-up animate-fade-up-delay-1">
        <SectionHeader
          title="Pricing"
          subtitle="One free league — upgrade once for the full tournament"
          icon={Crown}
        />
        <div className="grid gap-3">
          <Card variant="default" className="card-shine flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Starter</p>
              <p className="text-sm text-muted-foreground">
                {FREE_LEAGUE_LIMIT} private league included
              </p>
            </div>
            <span className="font-display text-3xl text-pitch-light">FREE</span>
          </Card>
          <Card variant="gold" className="card-shine flex items-center justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <p className="font-semibold text-gold-light">Tournament Pass</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Unlimited leagues · full FIFA 2026
              </p>
            </div>
            <div className="text-right">
              <span className="font-display text-3xl text-trophy">
                ₹{PREMIUM_PRICE_INR}
              </span>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                one-time
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Example leagues */}
      <section className="animate-fade-up animate-fade-up-delay-2">
        <SectionHeader
          title="Community Leagues"
          subtitle="See what others are running"
          icon={Users}
        />
        <div className="flex flex-col gap-2.5">
          {EXAMPLE_LEAGUES.map((league, i) => (
            <Card
              key={league.name}
              variant="elevated"
              padding="sm"
              className="card-shine flex items-center gap-4 transition hover:border-pitch/20"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-xl">
                {league.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {league.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {league.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3 w-3" />
                {league.members}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <p className="animate-fade-up animate-fade-up-delay-3 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
        {APP_NAME} · Predict · Compete · Win
      </p>
    </div>
  );
}
