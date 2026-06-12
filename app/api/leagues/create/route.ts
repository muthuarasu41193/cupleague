import { FREE_LEAGUE_LIMIT } from "@/lib/constants";
import { ensureProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/utils/invite-code";
import { NextResponse } from "next/server";

/**
 * POST /api/leagues/create
 * Creates a league server-side (reliable auth + profile + RLS).
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { name?: string; description?: string; emoji?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "League name is required" }, { status: 400 });
  }

  const { profile, error: profileError } = await ensureProfile(supabase, user);
  if (!profile) {
    return NextResponse.json(
      { error: profileError ?? "Profile setup failed" },
      { status: 500 }
    );
  }

  if (!profile.is_premium && profile.leagues_created >= FREE_LEAGUE_LIMIT) {
    return NextResponse.json(
      { error: "upgrade_required", message: "Free league limit reached" },
      { status: 402 }
    );
  }

  let inviteCode = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from("leagues")
      .select("id")
      .eq("invite_code", inviteCode)
      .maybeSingle();
    if (!existing) break;
    inviteCode = generateInviteCode();
  }

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .insert({
      name,
      description: body.description?.trim() || null,
      emoji: body.emoji ?? "⚽",
      invite_code: inviteCode,
      creator_id: profile.id,
    })
    .select()
    .single();

  if (leagueError || !league) {
    console.error("League insert error:", leagueError);
    return NextResponse.json(
      { error: leagueError?.message ?? "Failed to create league" },
      { status: 500 }
    );
  }

  const { error: memberError } = await supabase.from("league_members").insert({
    league_id: league.id,
    user_id: profile.id,
  });

  if (memberError) {
    console.error("Member insert error:", memberError);
    await supabase.from("leagues").delete().eq("id", league.id);
    return NextResponse.json(
      { error: memberError.message ?? "Failed to join league as creator" },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ leagues_created: profile.leagues_created + 1 })
    .eq("id", profile.id);

  if (updateError) {
    console.warn("leagues_created update failed:", updateError);
  }

  return NextResponse.json({
    inviteCode: league.invite_code,
    leagueId: league.id,
  });
}
