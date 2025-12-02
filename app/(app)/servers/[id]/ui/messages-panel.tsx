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
                new Date(a.sent_on || 0).getTime() -
                new Date(b.sent_on || 0).getTime()
        )
    );
    const [loadingMore, setLoadingMore] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    // scroll to bottom on mount
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, []);

    // realtime: append new messages (and scroll to bottom)
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

    async function loadOlder() {
        if (loadingMore || items.length === 0) return;
        setLoadingMore(true);
        try {
            const oldest = items[0];
            const beforeISO = oldest.sent_on ?? new Date().toISOString();
            const res = await fetch(
                `/api/servers/${serverId}/messages?limit=10&before=${encodeURIComponent(
                    beforeISO
                )}`
            );
            const json = (await res.json()) as { items: Msg[]; error?: string };
            if (!res.ok) throw new Error(json.error || "Failed to load older messages");

            setItems((prev) => {
                const next = [...json.items, ...prev];
                next.sort(
                    (a, b) =>
                        new Date(a.sent_on || 0).getTime() -
                        new Date(b.sent_on || 0).getTime()
                );
                return next;
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* load older */}
            <div className="mb-3 flex justify-center">
                <button
                    onClick={loadOlder}
                    disabled={loadingMore}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
                >
                    {loadingMore ? "Loading…" : "Load older"}
                </button>
            </div>

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
