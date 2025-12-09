"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MagicLinkPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${window.location.origin}/servers` },
        });

        if (error) setError(error.message);
        else setMessage("Magic link sent! Check your inbox.");
        setLoading(false);
    }

    return (
        <div className="mx-auto max-w-sm p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Sign in with Magic Link</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}
                <Button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Magic Link"}
                </Button>
            </form>

            <div className="text-sm text-muted-foreground">
                <p className="mt-4">
                    Prefer using password?{" "}
                    <a href="/auth/sign-in" className="underline">
                        Sign in with password
                    </a>
                </p>
            </div>
        </div>
    );
}
