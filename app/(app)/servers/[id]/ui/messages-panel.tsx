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

const ts = (m: Msg) => new Date(m.sent_on || 0).getTime();
const sortAsc = (a: Msg, b: Msg) => ts(a) - ts(b);

export default function MessagesPanel({
    serverId,
    initialItems,
}: {
    serverId: string;
    initialItems: Msg[];
}) {
    const [items, setItems] = useState<Msg[]>([...initialItems].sort(sortAsc));
    const listRef = useRef<HTMLDivElement>(null);
    const supabaseRef = useRef<ReturnType<typeof createBrowserSupabaseClient> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const isNearBottom = () => {
        const el = listRef.current;
        if (!el) return true;
        const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
        return gap < 48;
    };

    const scrollToBottom = (smooth = false) => {
        const el = listRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    };

    useEffect(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToBottom(false)));
    }, []);

    useEffect(() => {
        const supabase = (supabaseRef.current ??= createBrowserSupabaseClient());
        const channel = supabase
            .channel(`messages:${serverId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `server_id=eq.${serverId}`,
                },
                (payload) => {
                    const m = payload.new as Msg;
                    const shouldStick = isNearBottom();
                    setItems((prev) => {
                        if (prev.some((x) => x.id === m.id)) return prev;
                        return [...prev, m].sort(sortAsc);
                    });

                    if (shouldStick) {
                        requestAnimationFrame(() =>
                            requestAnimationFrame(() => scrollToBottom(true))
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [serverId]);

    useEffect(() => {
        let stopped = false;
        async function tick() {
            if (stopped) return;
            const latest = items[items.length - 1]?.sent_on;
            if (latest) {
                try {
                    const res = await fetch(
                        `/api/servers/${serverId}/messages?after=${encodeURIComponent(latest)}&limit=20`
                    );
                    const json = (await res.json()) as { items: Msg[] };
                    if (Array.isArray(json.items) && json.items.length > 0) {
                        const shouldStick = isNearBottom();
                        setItems((prev) => {
                            const merged = [...prev, ...json.items];
                            const dedup = Array.from(new Map(merged.map((m) => [m.id, m])).values());
                            dedup.sort(sortAsc);
                            return dedup;
                        });
                        if (shouldStick) {
                            requestAnimationFrame(() =>
                                requestAnimationFrame(() => scrollToBottom(true))
                            );
                        }
                    }
                } catch {
                    // ignore errors
                }
            }
            setTimeout(tick, 2000);
        }
        const t = setTimeout(tick, 2000);
        return () => {
            clearTimeout(t);
            stopped = true;
        };
    }, [serverId, items]);

    async function loadOlder() {
        if (loadingMore || items.length === 0) return;
        setLoadingMore(true);
        try {
            const oldest = items[0];
            const beforeISO = oldest.sent_on ?? new Date().toISOString();
            const res = await fetch(
                `/api/servers/${serverId}/messages?limit=10&before=${encodeURIComponent(beforeISO)}`
            );
            const json = (await res.json()) as { items: Msg[]; error?: string };
            if (!res.ok) throw new Error(json.error || "Failed to load older messages");

            setItems((prev) => {
                const merged = [...json.items, ...prev];
                const dedup = Array.from(new Map(merged.map((m) => [m.id, m])).values());
                dedup.sort(sortAsc);
                return dedup;
            });
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="mb-3 flex justify-center">
                <button
                    onClick={loadOlder}
                    disabled={loadingMore}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
                >
                    {loadingMore ? "Loading…" : "Load older"}
                </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-3 p-2">
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
                            {m.message && (
                                <p className="mt-1 whitespace-pre-wrap leading-relaxed">{m.message}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
