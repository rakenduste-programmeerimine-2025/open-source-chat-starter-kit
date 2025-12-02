"use client";

import { useEffect, useState } from "react";
import { createRSCClient } from "@/lib/supabase/server-rsc";
import RemoveMemberButton from "./remove-member-button";

type Member = {
    user_id: string;
    role: string;
    joined_at: string;
};

interface MembersListProps {
    serverId: string;
}

export default function MembersList({ serverId }: MembersListProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [canManage, setCanManage] = useState(false);

    useEffect(() => {
        const fetchMembers = async () => {
            const supabase = createRSCClient();

            // current user
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);

            // all users
            const { data, error } = await supabase
                .from("server_members")
                .select("user_id, role, joined_at")
                .eq("server_id", serverId)
                .order("joined_at", { ascending: true });

            if (error) {
                console.error(error);
                return;
            }

            setMembers(data);

            // user role
            const me = data.find((m) => m.user_id === user?.id);
            setCanManage(me?.role === "owner" || me?.role === "admin");
        };

        fetchMembers();
    }, [serverId]);

    return (
        <ul className="grid gap-3">
            {members.length === 0 ? (
                <li className="text-sm text-muted-foreground">No members yet.</li>
            ) : (
                members.map((m) => {
                    const showRemove = canManage && m.user_id !== currentUserId;

                    return (
                        <li
                            key={`${m.user_id}-${m.joined_at}`}
                            className="flex items-start justify-between gap-3 rounded-lg border p-3"
                        >
                            {/* left: user info */}
                            <div className="min-w-0">
                                <div
                                    className="truncate font-mono text-xs"
                                    title={m.user_id}
                                >
                                    {m.user_id}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Joined: {new Date(m.joined_at).toLocaleString()}
                                </div>
                            </div>

                            {/* right: role + remove button */}
                            <div className="ml-2 flex shrink-0 flex-wrap items-center gap-2">
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
