import { Button } from "@/components/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { JoinLeagueButton } from "./JoinLeagueButton";

interface JoinPageProps {
  params: Promise<{ inviteCode: string }>;
}

const RESERVED = new Set(["create", "login", "auth", "api", "dashboard"]);

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
    <div className="flex flex-col items-center gap-8 py-6">
      <Card variant="glass" className="card-shine w-full text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted text-5xl ring-1 ring-border">
          {league.emoji}
        </div>
        <Badge variant="host" className="mb-3">
          Private League
        </Badge>
        <h1 className="font-display text-4xl tracking-wide text-foreground">
          {league.name.toUpperCase()}
        </h1>
        {league.description && (
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
            {league.description}
          </p>
        )}
      </Card>

      <Card variant="gold" className="w-full text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
          Invite Code
        </p>
        <p className="font-mono text-3xl font-bold tracking-[0.3em] text-trophy">
          {league.invite_code}
        </p>
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded-lg bg-muted/60",
            "px-3 py-1 text-xs text-muted-foreground"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          {memberCount ?? 0} member{(memberCount ?? 0) !== 1 ? "s" : ""}
        </div>
      </Card>

      {user ? (
        <JoinLeagueButton leagueId={league.id} inviteCode={code} />
      ) : (
        <div className="w-full max-w-xs">
          <Link href={`/login?next=/${code}`}>
            <Button variant="gold">Sign In to Join</Button>
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Account required to enter this league
          </p>
        </div>
      )}
    </div>
  );
}
