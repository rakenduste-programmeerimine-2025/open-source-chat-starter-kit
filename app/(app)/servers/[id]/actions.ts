"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/* ---------- MEMBERS ---------- */

export async function removeMemberAction(serverId: string, userId: string) {
    if (!serverId || !userId) throw new Error("Missing ids");

    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        redirect("/auth/login");
    }

    const { error } = await supabase
        .from("server_members")
        .delete()
        .eq("server_id", serverId)
        .eq("user_id", userId);

    if (error) throw new Error(error.message);

    revalidatePath(`/servers/${serverId}`);
    return { ok: true };
}

/** add member by id or by nickname */
export async function addMemberAction(serverId: string, formData: FormData) {
    if (!serverId) throw new Error("Missing serverId");

    const supabase = createClient();

    // must be owner/admin
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) redirect("/auth/login");
    const meId = authData.user.id;

    const { data: roleRow, error: roleErr } = await supabase
        .from("server_members")
        .select("role")
        .eq("server_id", serverId)
        .eq("user_id", meId)
        .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!roleRow || !["owner", "admin"].includes(roleRow.role)) {
        throw new Error("You don't have permission to add members");
    }

    const mode = String(formData.get("mode") ?? "").trim() as "nickname" | "uuid" | "";

    let targetUserId: string | null = null;

    if (mode === "nickname") {
        const nickname = String(formData.get("nickname") ?? "").trim();
        if (!nickname) throw new Error("Nickname required");

        const { data: candidates, error: findErr } = await supabase
            .from("profiles")
            .select("id, display_name")
            .ilike("display_name", nickname)
            .limit(5);

        if (findErr) throw new Error(findErr.message);
        if (!candidates || candidates.length === 0) throw new Error("User not found");
        if (candidates.length > 1)
            throw new Error("Multiple users with this nickname, please use UUID or a more specific name");

        targetUserId = candidates[0].id;
    } else {
        const userId = String(formData.get("user_id") ?? "").trim();
        if (!userId) throw new Error("Missing user_id");
        targetUserId = userId;
    }

    const { data: existing, error: existErr } = await supabase
        .from("server_members")
        .select("user_id")
        .eq("server_id", serverId)
        .eq("user_id", targetUserId)
        .maybeSingle();

    if (existErr) throw new Error(existErr.message);
    if (existing) throw new Error("Already a member");

    const { error } = await supabase
        .from("server_members")
        .insert({ server_id: serverId, user_id: targetUserId, role: "member" });

    if (error) throw new Error(error.message);

    revalidatePath(`/servers/${serverId}`);
    return { ok: true };
}

/* ---------- MESSAGES ---------- */

export async function postMessageAction(serverId: string, formData: FormData) {
    const content = String(formData.get("content") ?? "").trim();
    if (!serverId) throw new Error("Missing server id");
    if (!content) throw new Error("Message content is required");

    const supabase = createClient();
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) redirect("/auth/login");

    const { error } = await supabase.from("messages").insert({
        server_id: serverId,
        sender_id: userData.user.id,
        message: content,
    });

    if (error) throw new Error(error.message);

    revalidatePath(`/servers/${serverId}`);
    return { ok: true };
}

/* ---------- SETTINGS ---------- */

export type ServerSettings = {
    show_user: "nickname" | "id";
    timestamp_format: string;
    background_color: string;  // right column colour
    message_density: "compact" | "normal";

    page_bg: string;          // page colour
    message_bg: string;       //  message window colour
    message_text: string;     //  message text colour
};

export async function getServerSettings(serverId: string): Promise<ServerSettings> {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) redirect("/auth/login");

    const { data } = await supabase
        .from("server_settings")
        .select(
            "show_user,timestamp_format,background_color,message_density,page_bg,message_bg,message_text"
        )
        .eq("server_id", serverId)
        .maybeSingle();

    return {
        show_user: (data?.show_user as ServerSettings["show_user"]) ?? "nickname",
        timestamp_format: data?.timestamp_format ?? "YYYY-MM-DD HH:mm",
        background_color: data?.background_color ?? "#ffffff",
        message_density: (data?.message_density as ServerSettings["message_density"]) ?? "normal",
        page_bg: data?.page_bg ?? "#ffffff",
        message_bg: data?.message_bg ?? "#ffffff",
        message_text: data?.message_text ?? "#111827",
    };
}

export async function upsertServerSettingsAction(serverId: string, fd: FormData) {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) redirect("/auth/login");

    const show_user = (String(fd.get("show_user") ?? "nickname") as "nickname" | "id");
    const timestamp_format = String(fd.get("timestamp_format") ?? "YYYY-MM-DD HH:mm");
    const background_color = String(fd.get("background_color") ?? "#ffffff");
    const message_density = (String(fd.get("message_density") ?? "normal") as "compact" | "normal");
    const page_bg = String(fd.get("page_bg") ?? "#ffffff");
    const message_bg = String(fd.get("message_bg") ?? "#ffffff");
    const message_text = String(fd.get("message_text") ?? "#111827");

    const { error } = await supabase
        .from("server_settings")
        .upsert(
            {
                server_id: serverId,
                show_user,
                timestamp_format,
                background_color,
                message_density,
                page_bg,
                message_bg,
                message_text,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "server_id" }
        );

    if (error) throw new Error(error.message);

    revalidatePath(`/servers/${serverId}`);
    revalidatePath(`/servers/${serverId}/edit`);
    return { ok: true };
}

/* ---------- SERVER META ---------- */

export async function updateServerAction(serverId: string, form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    const image_url_raw = String(form.get("image_url") ?? "").trim();
    const image_url = image_url_raw || null;

    if (!serverId || !name) throw new Error("Missing server id or name");

    const supabase = createClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) redirect("/auth/login");

    const { data: roleRow } = await supabase
        .from("server_members")
        .select("role")
        .eq("server_id", serverId)
        .eq("user_id", authData.user.id)
        .maybeSingle();

    if (roleRow?.role !== "owner") {
        throw new Error("Only owner can update this server");
    }

    const { error } = await supabase
        .from("servers")
        .update({ name, image_url })
        .eq("id", serverId);

    if (error) throw new Error(error.message);

    revalidatePath(`/servers`);
    revalidatePath(`/servers/${serverId}`);
    return { ok: true };
}
