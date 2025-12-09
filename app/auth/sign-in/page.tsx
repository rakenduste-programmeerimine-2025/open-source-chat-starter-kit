"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    async function onSignin(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErr(error.message);
        else window.location.href = "/servers";
    }

    async function onRecover() {
        setErr(null); setMsg(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset`,
        });
        if (error) setErr(error.message);
        else setMsg("Check your email for the reset link.");
    }

    return (
        <form onSubmit={onSignin} className="mx-auto max-w-sm space-y-3 p-6">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {err && <p className="text-sm text-red-500">{err}</p>}
            {msg && <p className="text-sm text-green-600">{msg}</p>}
            <Button type="submit">Sign in</Button>
            <button type="button" className="text-sm underline" onClick={onRecover}>Forgot password?</button>
            <div className="text-sm text-muted-foreground">
                Or <a className="underline" href="/auth/sign-up">create account</a>
                {" "}· Or <a className="underline" href="/auth/magic">use magic link</a>
            </div>
        </form>
    );
}
