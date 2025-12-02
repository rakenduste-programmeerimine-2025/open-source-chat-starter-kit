import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "30");
    const before = url.searchParams.get("before"); // ISO timestamp

    const supabase = createClient();

    let q = supabase
        .from("messages")
        .select("id, server_id, sender_id, message, sent_on")
        .eq("server_id", params.id)
        .order("sent_on", { ascending: false })
        .limit(limit);

    if (before) {
        q = q.lt("sent_on", before);
    }

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ items: data ?? [] });
}
