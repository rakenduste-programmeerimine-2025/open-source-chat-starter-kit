"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const BUCKET = process.env.NEXT_PUBLIC_AVATARS_BUCKET || "avatars";

export async function uploadAvatar(file: File, userId: string) {
    const supabase = createBrowserSupabaseClient();

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) throw upErr;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}
