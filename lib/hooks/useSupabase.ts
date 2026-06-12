"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

/**
 * Returns a browser Supabase client after mount (skips SSR prerender).
 */
export function useSupabase() {
  const [client, setClient] = useState<ReturnType<typeof createClient> | null>(
    null
  );

  useEffect(() => {
    setClient(createClient());
  }, []);

  return client;
}
