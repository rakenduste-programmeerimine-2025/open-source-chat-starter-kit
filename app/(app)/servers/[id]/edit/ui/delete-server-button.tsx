"use client";

import { useTransition, useState } from "react";
import { deleteServerAction } from "../actions";
import { Button } from "@/components/ui/button";

export default function DeleteServerButton({ serverId }: { serverId: string }) {
    const [pending, start] = useTransition();
    const [err, setErr] = useState<string | null>(null);

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="destructive"
                disabled={pending}
                onClick={() => {
                    setErr(null);
                    const ok = window.confirm(
                        "Delete this server? This action cannot be undone."
                    );
                    if (!ok) return;
                    start(async () => {
                        try {
                            await deleteServerAction(serverId);
                        } catch (e: unknown) {
                            setErr(e instanceof Error ? e.message : "Failed to delete server");
                        }
                    });
                }}
            >
                {pending ? "Deleting…" : "Delete"}
            </Button>
            {err && <span className="text-sm text-red-600">{err}</span>}
        </div>
    );
}
