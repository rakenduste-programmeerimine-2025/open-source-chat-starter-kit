import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const before = url.searchParams.get("before"); // ISO timestamp: older-than
    const after = url.searchParams.get("after");   // ISO timestamp: newer-than

    const supabase = createClient();

    let q = supabase
        .from("messages")
        .select("id, server_id, sender_id, message, sent_on")
        .eq("server_id", id);

    if (after) {
        // fetch newer than 'after' (ASC for UI)
        q = q.gt("sent_on", after).order("sent_on", { ascending: true }).limit(limit);
    } else {
        // default: last N newest first, we will reverse for UI
        q = q.order("sent_on", { ascending: false }).limit(limit);
        if (before) q = q.lt("sent_on", before);
    }

    const { data, error } = await q;
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // if 'after' used, data already ASC; otherwise reverse to ASC for UI
    const items = after ? (data ?? []) : (data ?? []).reverse();
    return NextResponse.json({ items });
}
