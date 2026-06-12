import { DashboardTabs } from "@/components/DashboardTabs";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

interface DashboardPageProps {
  params: Promise<{ inviteCode: string }>;
}

/**
 * League dashboard — /[inviteCode]/dashboard
 * Tabbed: Matches | Leaderboard | Invite
 */
export default async function DashboardPage({ params }: DashboardPageProps) {
  const { inviteCode } = await params;
  const code = inviteCode.toUpperCase();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/${code}/dashboard`);
  }

  const { data: league } = await supabase
    .from("leagues")
    .select("*")
    .eq("invite_code", code)
    .single();

  if (!league) notFound();

  // Must be a member to view dashboard
  const { data: membership } = await supabase
    .from("league_members")
    .select("id")
    .eq("league_id", league.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect(`/${code}`);
  }

  // Fetch dashboard data in parallel
  const [
    { data: matches },
    { data: predictions },
    { data: reactions },
    { data: memberRows },
  ] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true })
      .limit(20),
    supabase
      .from("predictions")
      .select("*")
      .eq("league_id", league.id),
    supabase
      .from("reactions")
      .select("*")
      .eq("league_id", league.id),
    supabase
      .from("league_members")
      .select("user_id, joined_at, profiles(*)")
      .eq("league_id", league.id),
  ]);

  const members = (memberRows ?? []).map((row) => {
    const profile = row.profiles as unknown as {
      id: string;
      username: string;
      email: string;
      is_premium: boolean;
      leagues_created: number;
      created_at: string;
    };
    return { ...profile, joined_at: row.joined_at };
  });

  return (
    <DashboardTabs
      league={league}
      initialMatches={matches ?? []}
      initialPredictions={predictions ?? []}
      initialReactions={reactions ?? []}
      members={members}
      currentUserId={user.id}
    />
  );
}
