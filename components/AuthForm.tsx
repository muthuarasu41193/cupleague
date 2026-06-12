"use client";

import { APP_NAME } from "@/lib/constants";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";

interface AuthFormProps {
  redirectTo?: string;
}

/** Magic-link email login — profile auto-created via Supabase trigger */
export function AuthForm({ redirectTo = "/" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-pitch-green/30 bg-pitch-green/10 p-6 text-center">
        <span className="text-4xl">📬</span>
        <h2 className="mt-3 text-xl font-bold text-white">Check your email</h2>
        <p className="mt-2 text-pitch-muted-text">
          We sent a magic link to <strong className="text-white">{email}</strong>.
          Click it to sign in to {APP_NAME}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-pitch-muted-text">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-pitch-muted-text" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-pitch-border bg-pitch-black py-4 pl-12 pr-4 text-lg text-white placeholder:text-pitch-muted-text focus:border-pitch-green focus:outline-none focus:ring-2 focus:ring-pitch-green/30"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading}>
        Send Magic Link ⚽
      </Button>
    </form>
  );
}
