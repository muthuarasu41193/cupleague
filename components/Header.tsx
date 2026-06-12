"use client";

import { APP_NAME } from "@/lib/constants";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { LogOut, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Header() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const supabase = useSupabase();

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-pitch-border bg-pitch-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-pitch-gold" />
          <span className="text-lg font-bold text-white">{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden max-w-[120px] truncate text-sm text-pitch-muted-text sm:inline">
                {email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-xl p-2 text-pitch-muted-text hover:bg-pitch-muted hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-pitch-green px-4 py-2 text-sm font-semibold text-white"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
