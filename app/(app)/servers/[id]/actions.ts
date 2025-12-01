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
