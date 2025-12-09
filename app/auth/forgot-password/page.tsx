"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) setErr(error.message);
    else setOk("We sent you a reset link. Please check your email.");
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      {err && <p className="text-sm text-red-500">{err}</p>}
      {ok && <p className="text-sm text-green-600">{ok}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>
      <div className="text-sm">
        <a className="underline" href="/auth/sign-in">Back to sign in</a>
      </div>
    </form>
  );
}
