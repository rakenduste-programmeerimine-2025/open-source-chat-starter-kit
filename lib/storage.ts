"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const BUCKET = process.env.NEXT_PUBLIC_AVATARS_BUCKET || "avatars";

export async function uploadAvatar(file: File, userId: string) {
    if (!file) throw new Error("No file selected");
    if (!userId) throw new Error("No user id");

    const supabase = createBrowserSupabaseClient();

    // optional sanity checks
    const maxMB = 5;
    if (file.size > maxMB * 1024 * 1024) {
        throw new Error(`Image is too large. Max ${maxMB}MB`);
    }
    if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
        throw new Error(upErr.message || "Upload failed (check bucket/policies)");
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}
