import { createRSCClient } from "@/lib/supabase/server-rsc";


type MsgRow = {
    id: string;
    server_id: string;
    content: string | null;
    image_url: string | null;
    created_at: string;
    author?: unknown;
    author_id?: unknown;
    user_id?: unknown;
};

function pickAuthor(row: MsgRow): string {
    const raw = (row.author ?? row.author_id ?? row.user_id) as unknown;
    if (typeof raw === "string") return raw;
    if (raw == null) return "unknown";
    try {
        return String(raw);
    } catch {
        return "unknown";
    }
}

export default async function MessagesList({ serverId }: { serverId: string }) {
    const supabase = createRSCClient();

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("server_id", serverId)
        .order("created_at", { ascending: true })
        .limit(100);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as MsgRow[];

    return (
        <ul className="grid gap-3">
            {rows.length === 0 ? (
                <li className="text-sm text-muted-foreground">No messages yet.</li>
            ) : (
                rows.map((m) => {
                    const author = pickAuthor(m);
                    return (
                        <li key={m.id} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">{author}</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(m.created_at).toLocaleString()}
                                </span>
                            </div>
                            {m.content && <p className="mt-1">{m.content}</p>}
                            {m.image_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={m.image_url}
                                    alt="attachment"
                                    className="mt-2 max-h-64 rounded-md border object-cover"
                                />
                            )}
                        </li>
                    );
                })
            )}
        </ul>
    );
}
