"use client";

import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UpgradeModal } from "@/components/UpgradeModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FREE_LEAGUE_LIMIT } from "@/lib/constants";
import { ensureProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { useSupabase } from "@/lib/hooks/useSupabase";
import type { Profile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldPlus } from "lucide-react";

const EMOJI_OPTIONS = ["⚽", "🏆", "🔥", "🌍", "🇧🇷", "🇦🇷", "🦁", "🐐"];

/** League creation form — freemium gated after first league */
export default function CreateLeaguePage() {
  const router = useRouter();
  const supabase = useSupabase();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("⚽");

  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;

    async function load() {
      const {
        data: { user },
      } = await sb.auth.getUser();

      if (!user) {
        router.push("/login?next=/create");
        return;
      }

      const { profile: p, error: profileErr } = await ensureProfile(sb, user);
      if (!p) {
        setError(profileErr ?? "Could not load your profile.");
        setLoading(false);
        return;
      }

      setProfile(p);
      setLoading(false);
    }

    load();
  }, [router, supabase]);

  const needsUpgrade =
    profile &&
    !profile.is_premium &&
    profile.leagues_created >= FREE_LEAGUE_LIMIT;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a league name.");
      return;
    }

    if (needsUpgrade) {
      setShowUpgrade(true);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/leagues/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          emoji,
        }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error === "upgrade_required") {
        setShowUpgrade(true);
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Failed to create league. Please try again.");
        return;
      }

      router.push(`/${data.inviteCode}/dashboard`);
      router.refresh();
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpgrade() {
    setPayLoading(true);
    setError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Failed to load payment gateway");
      setPayLoading(false);
      return;
    }

    const res = await fetch("/api/create-order", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to create order");
      setPayLoading(false);
      return;
    }

    openRazorpayCheckout({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      amount: data.amount,
      currency: data.currency,
      name: "CupLeague",
      description: "Unlimited leagues for FIFA 2026",
      order_id: data.orderId,
      prefill: { email: profile?.email },
      theme: { color: "#00a651" },
      handler: async (response) => {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });

        if (verifyRes.ok) {
          setProfile((p) => (p ? { ...p, is_premium: true } : p));
          setShowUpgrade(false);
        } else {
          setError("Payment verification failed");
        }
        setPayLoading(false);
      },
    });

    setPayLoading(false);
  }

  if (loading || !supabase) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <div>
      <PageHeader
        icon={ShieldPlus}
        title="Create League"
        subtitle="Set up your private FIFA 2026 prediction pool"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            League badge
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition",
                  emoji === e
                    ? "bg-pitch/20 ring-2 ring-pitch"
                    : "bg-muted ring-1 ring-border hover:bg-border/40"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="name"
          label="League name"
          required
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Office World Cup 2026"
        />

        <div>
          <label
            htmlFor="desc"
            className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Description
          </label>
          <textarea
            id="desc"
            maxLength={200}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who will be crowned champion?"
            className={cn(
              "w-full resize-none rounded-xl border border-border bg-surface px-4 py-3.5",
              "text-foreground placeholder:text-muted-foreground/60",
              "focus:border-pitch focus:outline-none focus:ring-2 focus:ring-pitch/20"
            )}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-danger/20">
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting} variant="gold" disabled={!profile}>
          Launch League
        </Button>

        {profile && !profile.is_premium && (
          <Card variant="default" padding="sm" className="text-center">
            <Badge variant="muted">
              {profile.leagues_created}/{FREE_LEAGUE_LIMIT} free league
              {profile.leagues_created !== 1 ? "s" : ""} used
            </Badge>
          </Card>
        )}
      </form>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onPay={handleUpgrade}
        loading={payLoading}
      />
    </div>
  );
}
