"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Parses input and ensures the caller is authenticated.
 */
export async function updateServerAction(serverId: string, formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const imageUrlRaw = String(formData.get("image_url") ?? "").trim();
    const image_url = imageUrlRaw.length > 0 ? imageUrlRaw : null;

    if (!serverId) throw new Error("Missing server id");
    if (!name) throw new Error("Server name is required");

    const supabase = createClient();
    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.id) {
        redirect("/auth/login");
    }

    return { ok: true, name, image_url };
}
