"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/auth/sign-in";
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="text-sm"
    >
      Sign out
    </Button>
  );
}
