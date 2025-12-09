import { createRSCClient } from "@/lib/supabase/server-rsc";

type Msg = {
    id: string;
    sender_id: string;
    message: string | null;
    sent_on: string | null;
};

export default async function MessagesList({ serverId }: { serverId: string }) {
    const supabase = createRSCClient();

    const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, message, sent_on")
        .eq("server_id", serverId)
        .order("sent_on", { ascending: true })
        .limit(100);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as Msg[];

    return (
        <ul className="grid gap-3">
            {rows.length === 0 ? (
                <li className="text-sm text-muted-foreground">No messages yet.</li>
            ) : (
                rows.map((m) => (
                    <li key={m.id} className="rounded-lg border bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{m.sender_id}</span>
                            <span className="text-xs text-muted-foreground">
                                {m.sent_on ? new Date(m.sent_on).toLocaleString() : "-"}
                            </span>
                        </div>
                        {m.message && <p className="mt-1 leading-relaxed">{m.message}</p>}
                    </li>
                ))
            )}
        </ul>
    );
}
