"use client";

import { APP_NAME } from "@/lib/constants";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { Mail } from "lucide-react";
import { useState } from "react";
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

      <Button type="submit" loading={loading} disabled={!supabase}>
        Send Magic Link
      </Button>
    </form>
  );
}
