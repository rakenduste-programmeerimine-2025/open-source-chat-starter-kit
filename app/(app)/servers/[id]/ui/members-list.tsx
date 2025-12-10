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

    const members =
        (data ?? []) as { user_id: string; role: string; joined_at: string }[];

    return (
        <ul className="grid gap-3">
            {members.length === 0 ? (
                <li className="text-sm text-muted-foreground">No members yet.</li>
            ) : (
                members.map((m) => {
                    const showRemove =
                        Boolean(canManage && currentUserId && m.user_id !== currentUserId);

                    return (
                        <li
                            key={`${m.user_id}-${m.joined_at}`}
                            className="flex w-full items-start justify-between gap-3 rounded-lg border p-3 overflow-hidden"
                        >
                            {/* left: user info  */}
                            <div className="flex-1 min-w-0">
                                <div className="truncate font-mono text-xs" title={m.user_id}>
                                    {m.user_id}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Joined: {new Date(m.joined_at).toLocaleString()}
                                </div>
                            </div>

                            {/* right: role + remove */}
                            <div className="ml-2 flex shrink-0 items-center gap-2">
                                <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs">
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
