import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — use in Client Components only.
 * Reads session from cookies automatically via @supabase/ssr.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. See .env.example"
    );
  }

  return createBrowserClient(url, key);
}
