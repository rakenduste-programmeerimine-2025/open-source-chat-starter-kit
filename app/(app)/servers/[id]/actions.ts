"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(`/servers/${serverId}`);
    return { ok: true };
}

/**
add member by id or by nickname
 */
export async function addMemberAction(serverId: string, formData: FormData) {
    if (!serverId) throw new Error("Missing serverId");

    const supabase = createClient();

    // check for admin role
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) redirect("/auth/login");
    const meId = authData.user.id;

    //(owner/admin)
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

    const mode = String(formData.get("mode") ?? "").trim() as
        | "nickname"
        | "uuid"
        | "";

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

        if (!candidates || candidates.length === 0) {
            throw new Error("User not found");
        }
        if (candidates.length > 1) {
            // if multiple same nicknames
            throw new Error("Multiple users with this nickname, please use UUID or a more specific name");
        }

        targetUserId = candidates[0].id;
    } else {
        // by id
        const userId = String(formData.get("user_id") ?? "").trim();
        if (!userId) throw new Error("Missing user_id");
        targetUserId = userId;
    }

    // already a member
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
