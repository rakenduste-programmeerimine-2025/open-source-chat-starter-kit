"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Updates a server (name, image_url) and redirects to /servers.
 * Access controlled by RLS (owner/admin).
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

    const { error } = await supabase
        .from("servers")
        .update({ name, image_url })
        .eq("id", serverId);

    if (error) throw new Error(error.message);

    revalidatePath(`/servers/${serverId}/edit`);
    redirect("/servers");
}
