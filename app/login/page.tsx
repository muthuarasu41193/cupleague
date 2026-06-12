import { AuthForm } from "@/components/AuthForm";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

/** Magic-link login page — redirects if already authenticated */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next = "/" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(next);

  return (
    <div className="mx-auto max-w-sm">
      <div className="mb-8 text-center">
        <span className="text-5xl">⚽</span>
        <h1 className="mt-3 text-2xl font-black text-white">
          Sign in to {APP_NAME}
        </h1>
        <p className="mt-2 text-pitch-muted-text">
          No password needed — we&apos;ll email you a magic link.
        </p>
      </div>
      <AuthForm redirectTo={next} />
    </div>
  );
}
