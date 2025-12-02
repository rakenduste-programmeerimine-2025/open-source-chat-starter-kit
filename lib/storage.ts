"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export async function uploadAvatar(file: File, userId: string) {
    const supabase = createBrowserSupabaseClient();

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) throw upErr;

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return data.publicUrl;
}
