import { createRSCClient } from "@/lib/supabase/server-rsc";

export default async function MembersList({ serverId }: { serverId: string }) {
    const supabase = createRSCClient();

    // RLS: returns only if viewer is a member
    const { data, error } = await supabase
        .from("server_members")
        .select("user_id, role, joined_at")
        .eq("server_id", serverId)
        .order("joined_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    const members = data ?? [];

    return (
        <ul className="grid gap-2">
            {members.length === 0 ? (
                <li className="text-sm text-muted-foreground">No members yet.</li>
            ) : (
                members.map((m) => (
                    <li
                        key={`${m.user_id}-${m.joined_at}`}
                        className="flex items-center justify-between rounded-lg border p-3"
                    >
                        <div className="min-w-0">
                            <div className="font-medium truncate">{m.user_id}</div>
                            <div className="text-xs text-muted-foreground">
                                Joined: {new Date(m.joined_at).toLocaleString()}
                            </div>
                        </div>
                        <span className="text-xs rounded-full border px-2 py-0.5">
                            {m.role}
                        </span>
                    </li>
                ))
            )}
        </ul>
    );
}
