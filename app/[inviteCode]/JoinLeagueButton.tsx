"use client";

import { Button } from "@/components/Button";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface JoinLeagueButtonProps {
  leagueId: string;
  inviteCode: string;
}

/** Client button that inserts league_members row and redirects to dashboard */
export function JoinLeagueButton({
  leagueId,
  inviteCode,
}: JoinLeagueButtonProps) {
  const router = useRouter();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=/${inviteCode}`);
      return;
    }

    const { error: joinError } = await supabase
      .from("league_members")
      .insert({ league_id: leagueId, user_id: user.id });

    if (joinError) {
      // Already a member — just redirect
      if (joinError.code === "23505") {
        router.push(`/${inviteCode}/dashboard`);
        return;
      }
      setError(joinError.message);
      setLoading(false);
      return;
    }

    router.push(`/${inviteCode}/dashboard`);
  }

  return (
    <div className="w-full max-w-xs">
      <Button variant="gold" onClick={handleJoin} loading={loading}>
        Join this League 🏆
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
