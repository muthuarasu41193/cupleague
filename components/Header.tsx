"use client";

import { APP_NAME } from "@/lib/constants";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { cn } from "@/lib/utils";
import { LogOut, Shield } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pitch/15 ring-1 ring-pitch/30 transition group-hover:bg-pitch/25">
            <Shield className="h-5 w-5 text-pitch-light" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <span className="font-display text-xl tracking-wider text-foreground">
              {APP_NAME}
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              WC 2026
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {email ? (
            <>
              <span className="hidden max-w-[100px] truncate rounded-lg bg-muted px-2.5 py-1 text-xs text-muted-foreground sm:inline">
                {email.split("@")[0]}
              </span>
              <button
                onClick={handleSignOut}
                className={cn(
                  "rounded-xl p-2 text-muted-foreground",
                  "transition hover:bg-muted hover:text-foreground"
                )}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-pitch/15 px-4 py-2 text-sm font-semibold text-pitch-light ring-1 ring-pitch/30 transition hover:bg-pitch/25"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
