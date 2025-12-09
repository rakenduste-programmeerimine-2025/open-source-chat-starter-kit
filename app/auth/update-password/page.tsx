"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(() => setReady(true));
  }, [supabase]);

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault(); setErr(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErr(error.message);
    else window.location.href = "/servers";
  }

  if (!ready) return <div className="p-6">Preparing session…</div>;

  return (
    <form onSubmit={onUpdate} className="mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-2xl font-semibold">Set new password</h1>
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="text-sm text-red-500">{err}</p>}
      <Button type="submit">Update password</Button>
    </form>
  );
}
