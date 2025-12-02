"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatar } from "@/lib/storage";

type Profile = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
};

export default function MePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();
            if (userErr || !user) {
                window.location.href = "/auth/login";
                return;
            }
            const { data } = await supabase
                .from("profiles")
                .select("id, display_name, avatar_url")
                .eq("id", user.id)
                .maybeSingle();

            if (!data) {
                // ensure row exists
                await supabase.from("profiles").insert({ id: user.id }).select().single();
                setProfile({ id: user.id, display_name: null, avatar_url: null });
            } else {
                setProfile(data as Profile);
                setName(data.display_name ?? "");
            }
            setLoading(false);
        })();
    }, []);

    async function onSave() {
        if (!profile) return;
        setSaving(true);
        setError(null);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from("profiles")
                .update({ display_name: name })
                .eq("id", profile.id);
            if (error) throw error;
            setProfile((p) => (p ? { ...p, display_name: name } : p));
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message || "Failed to save");
            } else {
                setError("Failed to save");
            }
        } finally {
            setSaving(false);
        }
    }

    async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
        if (!profile) return;
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setSaving(true);
            const url = await uploadAvatar(file, profile.id);
            const supabase = createClient();
            const { error } = await supabase
                .from("profiles")
                .update({ avatar_url: url })
                .eq("id", profile.id);
            if (error) throw error;
            setProfile((p) => (p ? { ...p, avatar_url: url } : p));
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message || "Failed to upload avatar");
            } else {
                setError("Failed to upload avatar");
            }
        } finally {
            setSaving(false);
        }

    }

    if (loading) return <main className="p-6">Loading…</main>;

    return (
        <main className="mx-auto max-w-xl p-6">
            <h1 className="mb-4 text-2xl font-semibold">My profile</h1>

            <div className="rounded-xl border p-4 space-y-4">
                <div className="flex items-center gap-4">
                    {profile?.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={profile.avatar_url}
                            alt="avatar"
                            className="h-16 w-16 rounded-full border object-cover"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-full border flex items-center justify-center text-sm">
                            ?
                        </div>
                    )}
                    <div>
                        <label className="block text-sm mb-1">Change avatar</label>
                        <input type="file" accept="image/*" onChange={onPickAvatar} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm mb-1">Display name</label>
                    <input
                        className="w-full rounded-md border px-3 py-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                    />
                </div>

                {!!error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="rounded-md border px-4 py-2 hover:bg-muted disabled:opacity-50"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
        </main>
    );
}
