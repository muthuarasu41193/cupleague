"use client";

import { APP_NAME } from "@/lib/constants";
import {
  getAuthErrorMessage,
  getMagicLinkCooldownRemaining,
  setMagicLinkCooldown,
} from "@/lib/auth-errors";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { Clock, Mail } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";

interface AuthFormProps {
  redirectTo?: string;
}

export function AuthForm({ redirectTo = "/" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const supabase = useSupabase();

  const tickCooldown = useCallback(() => {
    setCooldown(getMagicLinkCooldownRemaining());
  }, []);

  useEffect(() => {
    tickCooldown();
    const id = setInterval(tickCooldown, 1000);
    return () => clearInterval(id);
  }, [tickCooldown]);

  async function sendMagicLink() {
    if (!supabase || cooldown > 0) return;

    setLoading(true);
    setError(null);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (authError) {
      setError(getAuthErrorMessage(authError.message));
      return;
    }

    setMagicLinkCooldown();
    tickCooldown();
    setSent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendMagicLink();
  }

  if (sent) {
    return (
      <Card variant="glass" className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pitch/15 ring-1 ring-pitch/30">
          <Mail className="h-6 w-6 text-pitch-light" />
        </div>
        <h2 className="font-display text-2xl tracking-wide text-foreground">
          CHECK YOUR INBOX
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Magic link sent to{" "}
          <strong className="text-foreground">{email}</strong>. Tap it to enter{" "}
          {APP_NAME}.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Link expires in ~1 hour. Check spam if you don&apos;t see it.
        </p>

        <div className="mt-5 border-t border-border/50 pt-4">
          <Button
            type="button"
            variant="outline"
            size="md"
            loading={loading}
            disabled={cooldown > 0}
            onClick={() => sendMagicLink()}
          >
            {cooldown > 0 ? (
              <>
                <Clock className="h-4 w-4" />
                Resend in {cooldown}s
              </>
            ) : (
              "Resend magic link"
            )}
          </Button>
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        error={error ?? undefined}
      />

      {error?.includes("Too many login emails") && (
        <Card variant="default" padding="sm" className="border-gold/20 bg-gold/5">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-gold-light">Tip:</strong> Search your inbox
            for an older CupLeague email — previous magic links often still work.
            To raise limits long-term, set up custom SMTP in Supabase →
            Authentication → Email.
          </p>
        </Card>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={!supabase || cooldown > 0}
      >
        {cooldown > 0 ? `Wait ${cooldown}s…` : "Send Magic Link"}
      </Button>
    </form>
  );
}
