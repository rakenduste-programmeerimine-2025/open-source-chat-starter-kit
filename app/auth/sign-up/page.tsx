"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null); setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) { setErr(error.message); setLoading(false); return; }

    if (data.user) {
      const { error: upErr } = await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
      });
      if (upErr) { setErr(upErr.message); setLoading(false); return; }
    }

    if (!data.session) {
      setOk("Account created. Please check your email to confirm.");
      setLoading(false);
      return;
    }

    window.location.href = "/servers";
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-3 p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="text-sm text-red-500">{err}</p>}
      {ok && <p className="text-sm text-green-600">{ok}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Sign up"}
      </Button>
      <div className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <a className="underline" href="/auth/sign-in">Sign in</a>
        {" "}· Or <a className="underline" href="/auth/login">use magic link</a>
      </div>
    </form>
  );
}
