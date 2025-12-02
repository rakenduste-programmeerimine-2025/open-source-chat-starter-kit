"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    // keep messages sorted asc by sent_on
    const [items, setItems] = useState<Msg[]>(
        [...initialItems].sort(
            (a, b) =>
                new Date(a.sent_on || 0).getTime() - new Date(b.sent_on || 0).getTime()
        )
    );
    const [loadingMore, setLoadingMore] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    // autoscroll to bottom on first mount and when a new item arrives
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
                        const next = [...prev, m as Msg];
                        next.sort(
                            (a, b) =>
                                new Date(a.sent_on || 0).getTime() -
                                new Date(b.sent_on || 0).getTime()
                        );
                        return next;
                    });
                    // scroll to bottom on new message
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

    const oldest = useMemo(() => items[0]?.sent_on ?? null, [items]);

    async function loadMore() {
        if (!oldest) return;
        setLoadingMore(true);
        try {
            const url = `/api/servers/${serverId}/messages?limit=30&before=${encodeURIComponent(
                oldest
            )}`;
            const res = await fetch(url);
            const json = await res.json();
            const older = (json.items ?? []) as Msg[];
            setItems((prev) => {
                const merged = [...older, ...prev];
                const seen = new Set<string>();
                return merged.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
            });
            // keep scroll roughly in place
            queueMicrotask(() => {
                if (!listRef.current) return;
                listRef.current.scrollTop = listRef.current.scrollHeight / 3;
            });
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <div className="flex h-full flex-col">
            <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-3">
                    <div className="flex justify-center py-2">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore || !oldest}
                            className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                        >
                            {loadingMore ? "Loading…" : "Load older"}
                        </button>
                    </div>

                    {items.map((m) => (
                        <div key={m.id} className="rounded-lg border bg-white p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground truncate font-mono" title={m.sender_id}>
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
