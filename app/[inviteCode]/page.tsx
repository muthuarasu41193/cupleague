import { Button } from "@/components/Button";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { JoinLeagueButton } from "./JoinLeagueButton";

interface JoinPageProps {
  params: Promise<{ inviteCode: string }>;
}

/** Reserved paths that should not be treated as invite codes */
const RESERVED = new Set([
  "create",
  "login",
  "auth",
  "api",
  "dashboard",
]);

/**
 * Join page — /[inviteCode]
 * Shows league info and "Join this League" button.
 */
export default async function JoinPage({ params }: JoinPageProps) {
  const { inviteCode } = await params;
  const code = inviteCode.toUpperCase();

  if (RESERVED.has(code.toLowerCase()) || code.length !== 6) {
    notFound();
  }

  const supabase = await createClient();

  const { data: league } = await supabase
    .from("leagues")
    .select("*")
    .eq("invite_code", code)
    .single();

  if (!league) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already a member, go straight to dashboard
  if (user) {
    const { data: membership } = await supabase
      .from("league_members")
      .select("id")
      .eq("league_id", league.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      redirect(`/${code}/dashboard`);
    }
  }

  const { count: memberCount } = await supabase
    .from("league_members")
    .select("*", { count: "exact", head: true })
    .eq("league_id", league.id);

  return (
    <div className="flex flex-col items-center gap-8 py-8 text-center">
      <span className="text-7xl">{league.emoji}</span>

      <div>
        <h1 className="text-3xl font-black text-white">{league.name}</h1>
        {league.description && (
          <p className="mt-2 text-lg text-pitch-muted-text">
            {league.description}
          </p>
        )}
      </div>

      <div className="rounded-2xl bg-pitch-card px-6 py-3">
        <p className="text-sm text-pitch-muted-text">Invite code</p>
        <p className="font-mono text-2xl font-black tracking-widest text-pitch-gold">
          {league.invite_code}
        </p>
        <p className="mt-1 text-sm text-pitch-muted-text">
          {memberCount ?? 0} member{(memberCount ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      {user ? (
        <JoinLeagueButton leagueId={league.id} inviteCode={code} />
      ) : (
        <div className="w-full max-w-xs">
          <Link href={`/login?next=/${code}`}>
            <Button variant="gold">Sign in to Join</Button>
          </Link>
          <p className="mt-3 text-sm text-pitch-muted-text">
            You need an account to join this league
          </p>
        </div>
      )}
    </div>
  );
}
