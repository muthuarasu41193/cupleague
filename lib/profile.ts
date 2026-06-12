import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

/**
 * Ensures the signed-in user has a profiles row.
 * Uses a security-definer RPC when available, otherwise client insert.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return { profile: existing as Profile, error: null };
  }

  if (fetchError) {
    console.error("Profile fetch error:", fetchError);
  }

  // Prefer DB function (works even without client INSERT policy)
  const { data: fromRpc, error: rpcError } = await supabase.rpc(
    "ensure_user_profile"
  );

  if (fromRpc && !rpcError) {
    return { profile: fromRpc as Profile, error: null };
  }

  if (rpcError) {
    console.warn("ensure_user_profile RPC unavailable:", rpcError.message);
  }

  const email = user.email ?? "";
  const username = email.split("@")[0] || "player";

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: user.id, email, username })
    .select("*")
    .single();

  if (inserted) {
    return { profile: inserted as Profile, error: null };
  }

  // Race: another request may have created the profile
  const { data: retry } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (retry) {
    return { profile: retry as Profile, error: null };
  }

  return {
    profile: null,
    error:
      insertError?.message ??
      rpcError?.message ??
      "Could not create your profile. Run supabase/fix-profiles.sql in Supabase.",
  };
}
