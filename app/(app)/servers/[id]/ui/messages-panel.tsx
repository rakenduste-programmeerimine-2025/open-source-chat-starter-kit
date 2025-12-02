"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Msg = {
    id: string;
    server_id: string;
    sender_id: string;
    message: string | null;
    sent_on: string | null;
};

export default function MessagesPanel({
    serverId,
    initialItems,
}: {
    serverId: string;
    initialItems: Msg[];
}) {
    const [items, setItems] = useState<Msg[]>(
        [...initialItems].sort(
            (a, b) =>
                new Date(a.sent_on || 0).getTime() - new Date(b.sent_on || 0).getTime()
        )
    );
    const listRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, []);

    useEffect(() => {
        const supabase = createBrowserSupabaseClient();

        const channel = supabase
            .channel(`messages:${serverId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `server_id=eq.${serverId}` },
                (payload) => {
                    const m = payload.new as unknown as Msg;
                    setItems((prev) => {
                        const next = [...prev, m];
                        next.sort(
                            (a, b) =>
                                new Date(a.sent_on || 0).getTime() -
                                new Date(b.sent_on || 0).getTime()
                        );
                        return next;
                    });
                    queueMicrotask(() =>
                        listRef.current?.scrollTo({
                            top: listRef.current.scrollHeight,
                            behavior: "smooth",
                        })
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [serverId]);

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-3 p-1">
                    {items.map((m) => (
                        <div key={m.id} className="rounded-lg border bg-white p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span
                                    className="max-w-[60%] truncate font-mono text-xs text-muted-foreground"
                                    title={m.sender_id}
                                >
                                    {m.sender_id}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {m.sent_on ? new Date(m.sent_on).toLocaleString() : "-"}
                                </span>
                            </div>
                            {m.message && <p className="mt-1 leading-relaxed">{m.message}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
