"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Creates a server. Trigger will auto-add creator as owner via server_members.
 * Stays on /servers (no redirect), just revalidates the page.
 */
export async function createServerAction(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const imageUrlRaw = String(formData.get("image_url") ?? "").trim();
    const image_url = imageUrlRaw.length > 0 ? imageUrlRaw : null;

    if (!name) throw new Error("Server name is required");

    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) redirect("/auth/login");

    const { error } = await supabase.from("servers").insert({
        name,
        image_url,
        created_by: userData.user.id,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/servers");
    return { ok: true };
}
