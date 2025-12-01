"use client";

import { useTransition, useState } from "react";
import { removeMemberAction } from "../actions";
import { Button } from "@/components/ui/button";

export default function RemoveMemberButton({
    serverId,
    memberUserId,
}: {
    serverId: string;
    memberUserId: string;
}) {
    const [pending, start] = useTransition();
    const [err, setErr] = useState<string | null>(null);

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => {
                    setErr(null);
                    const ok = window.confirm("Remove this member from the server?");
                    if (!ok) return;
                    start(async () => {
                        try {
                            await removeMemberAction(serverId, memberUserId);
                        } catch (e: unknown) {
                            setErr(e instanceof Error ? e.message : "Failed to remove member");
                        }
                    });
                }}
            >
                {pending ? "Removing…" : "Remove"}
            </Button>
            {err && <span className="text-xs text-red-600">{err}</span>}
        </div>
    );
}
