import { createRSCClient } from "@/lib/supabase/server-rsc";

type Msg = {
    id: string;
    author: string;
    content: string | null;
    image_url: string | null;
    created_at: string;
};

export default async function MessagesList({ serverId }: { serverId: string }) {
    const supabase = createRSCClient();

    const { data, error } = await supabase
        .from("messages")
        .select("id, author, content, image_url, created_at")
        .eq("server_id", serverId)
        .order("created_at", { ascending: true })
        .limit(100);

    if (error) throw new Error(error.message);

    const messages = (data ?? []) as Msg[];

    return (
        <ul className="grid gap-3">
            {messages.length === 0 ? (
                <li className="text-sm text-muted-foreground">No messages yet.</li>
            ) : (
                messages.map((m) => (
                    <li key={m.id} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{m.author}</span>
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
                ))
            )}
        </ul>
    );
}
