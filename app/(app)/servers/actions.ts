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

/**
 * Deletes a server (messages -> members -> server).
 * Only owner (created_by) can delete.
 */
export async function deleteServerAction(serverId: string) {
    if (!serverId) throw new Error("Missing server id");

    const supabase = createClient();

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth?.user) redirect("/auth/login");
    const meId = auth.user.id;

    // check ownership
    const { data: srv, error: srvErr } = await supabase
        .from("servers")
        .select("id, created_by")
        .eq("id", serverId)
        .maybeSingle();

    if (srvErr) throw new Error(srvErr.message);
    if (!srv) throw new Error("Server not found");
    if (srv.created_by !== meId) throw new Error("Only the owner can delete this server");

    // delete children first to avoid FK/RLS issues
    const delMsgs = await supabase.from("messages").delete().eq("server_id", serverId);
    if (delMsgs.error) throw new Error(delMsgs.error.message);

    const delMembers = await supabase.from("server_members").delete().eq("server_id", serverId);
    if (delMembers.error) throw new Error(delMembers.error.message);

    const delServer = await supabase.from("servers").delete().eq("id", serverId);
    if (delServer.error) throw new Error(delServer.error.message);

    revalidatePath("/servers");
    return { ok: true };
}
