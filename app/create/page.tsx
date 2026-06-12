"use client";

import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UpgradeModal } from "@/components/UpgradeModal";
import { FREE_LEAGUE_LIMIT } from "@/lib/constants";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import { useSupabase } from "@/lib/hooks/useSupabase";
import type { Profile } from "@/lib/types";
import { generateInviteCode } from "@/utils/invite-code";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

  const EMOJI_OPTIONS = ["⚽", "🏆", "🔥", "🌍", "🇧🇷", "🇦🇷", "🦁", "🐐"];

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

      const { data } = await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
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
    if (!profile || !supabase) return;

    if (needsUpgrade) {
      setShowUpgrade(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    let inviteCode = generateInviteCode();
    let attempts = 0;

    // Retry if code collision (unlikely)
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("leagues")
        .select("id")
        .eq("invite_code", inviteCode)
        .maybeSingle();

      if (!existing) break;
      inviteCode = generateInviteCode();
      attempts++;
    }

    const { data: league, error: leagueError } = await supabase
      .from("leagues")
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        emoji,
        invite_code: inviteCode,
        creator_id: profile.id,
      })
      .select()
      .single();

    if (leagueError) {
      setError(leagueError.message);
      setSubmitting(false);
      return;
    }

    // Creator joins automatically
    await supabase.from("league_members").insert({
      league_id: league.id,
      user_id: profile.id,
    });

    // Increment leagues_created (RPC or direct update)
    await supabase
      .from("profiles")
      .update({ leagues_created: profile.leagues_created + 1 })
      .eq("id", profile.id);

    router.push(`/${inviteCode}/dashboard`);
  }

  async function handleUpgrade() {
    setPayLoading(true);

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
      theme: { color: "#1a8f3c" },
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

  if (loading || !supabase)
    return <LoadingSpinner message="Loading your profile..." />;

  return (
    <div>
      <div className="mb-8 text-center">
        <span className="text-5xl">🏟️</span>
        <h1 className="mt-3 text-2xl font-black text-white">Create League</h1>
        <p className="text-pitch-muted-text">
          Set up your private FIFA 2026 prediction pool
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Emoji picker */}
        <div>
          <label className="mb-2 block text-sm font-medium text-pitch-muted-text">
            League emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${
                  emoji === e
                    ? "bg-pitch-green ring-2 ring-pitch-green"
                    : "bg-pitch-card hover:bg-pitch-muted"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-pitch-muted-text">
            League name *
          </label>
          <input
            id="name"
            required
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Office World Cup 2026"
            className="w-full rounded-2xl border border-pitch-border bg-pitch-card py-4 px-4 text-lg text-white placeholder:text-pitch-muted-text focus:border-pitch-green focus:outline-none focus:ring-2 focus:ring-pitch-green/30"
          />
        </div>

        <div>
          <label htmlFor="desc" className="mb-2 block text-sm font-medium text-pitch-muted-text">
            Short description
          </label>
          <textarea
            id="desc"
            maxLength={200}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who will be crowned champion?"
            className="w-full resize-none rounded-2xl border border-pitch-border bg-pitch-card py-4 px-4 text-white placeholder:text-pitch-muted-text focus:border-pitch-green focus:outline-none focus:ring-2 focus:ring-pitch-green/30"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting} variant="gold">
          Create League 🚀
        </Button>

        {profile && !profile.is_premium && (
          <p className="text-center text-sm text-pitch-muted-text">
            {profile.leagues_created}/{FREE_LEAGUE_LIMIT} free league
            {profile.leagues_created !== 1 ? "s" : ""} used
          </p>
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
