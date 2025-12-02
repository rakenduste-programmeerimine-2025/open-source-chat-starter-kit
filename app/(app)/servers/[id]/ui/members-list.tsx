import { createRSCClient } from "@/lib/supabase/server-rsc";
import RemoveMemberButton from "./remove-member-button";

export default async function MembersList({ serverId }: { serverId: string }) {
    const supabase = createRSCClient();

    // who am I?
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id ?? null;

    // what is my role in this server?
    const { data: myRow } = await supabase
        .from("server_members")
        .select("role")
        .eq("server_id", serverId)
        .eq("user_id", currentUserId)
        .maybeSingle();

    const myRole = myRow?.role ?? null;
    const canManage = myRole === "owner" || myRole === "admin";

    // list members
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
                members.map((m) => {
                    const showRemove = canManage && m.user_id !== currentUserId;
                    return (
                        <li
                            key={`${m.user_id}-${m.joined_at}`}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <div className="min-w-0">
                                <div
                                    className="font-mono text-xs truncate"
                                    title={m.user_id}
                                >
                                    {m.user_id}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Joined: {new Date(m.joined_at).toLocaleString()}
                                </div>
                            </div>

                            <div className="ml-3 shrink-0 flex items-center gap-3">
                                <span className="text-xs rounded-full border px-2 py-0.5">
                                    {m.role}
                                </span>
                                {showRemove && (
                                    <RemoveMemberButton
                                        serverId={serverId}
                                        memberUserId={m.user_id}
                                    />
                                )}
                            </div>
                        </li>

                    );
                })
            )}
        </ul>
    );
}
