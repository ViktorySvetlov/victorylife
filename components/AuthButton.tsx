"use client";

import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <button onClick={signIn} className="shine relative w-full overflow-hidden rounded-3xl bg-black px-6 py-4 text-base font-bold text-white shadow-soft transition active:scale-[.98]">
      Войти через Google
    </button>
  );
}
