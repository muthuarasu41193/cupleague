import { AuthForm } from "@/components/AuthForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { APP_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { LogIn } from "lucide-react";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next = "/" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(next);

  return (
    <div className="mx-auto max-w-sm">
      <PageHeader
        icon={LogIn}
        title={`Sign In`}
        subtitle={`Enter ${APP_NAME} with a passwordless magic link.`}
      />
      <AuthForm redirectTo={next} />
    </div>
  );
}
