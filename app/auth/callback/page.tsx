"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * The login link lands here with the session in the URL fragment (#access_token=…).
 * We store it as cookies via the Supabase browser client, then open the studio.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (!access_token || !refresh_token) {
      router.replace("/login?error=link");
      return;
    }
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => router.replace(error ? "/login?error=link" : "/studio"));
  }, [router]);

  return (
    <div className="mx-auto max-w-md px-5 py-32 text-center">
      <p className="font-serif text-4xl italic">Einen Moment …</p>
    </div>
  );
}
