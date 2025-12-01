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

export async function addMemberAction(serverId: string, formData: FormData) {
    const userId = String(formData.get("user_id") ?? "").trim();
    if (!serverId || !userId) throw new Error("Missing serverId or user_id");

    const supabase = createClient();
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData?.user) redirect("/auth/login");
    const { error } = await supabase
        .from("server_members")
        .insert({ server_id: serverId, user_id: userId, role: "member" });

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
    const uid = userData.user.id;

    const tryInsert = async (authorColumn: "author" | "author_id" | "user_id") => {
        const payload: Record<string, unknown> = {
            server_id: serverId,
            content,
            image_url: null,
        };
        payload[authorColumn] = uid;

        const { error } = await supabase.from("messages").insert(payload);
        return error as { code?: string; message: string } | null;
    };

    const order: Array<"author" | "author_id" | "user_id"> = [
        "author",
        "author_id",
        "user_id",
    ];

    let lastErr: { code?: string; message: string } | null = null;
    for (const col of order) {
        const err = await tryInsert(col);
        if (!err) {
            revalidatePath(`/servers/${serverId}`);
            return { ok: true };
        }
        if (err.code === "42703" || /does not exist/i.test(err.message)) {
            lastErr = err;
            continue;
        }
        throw new Error(err.message);
    }

    throw new Error(
        lastErr?.message || "Failed to insert message: unknown author column"
    );
}