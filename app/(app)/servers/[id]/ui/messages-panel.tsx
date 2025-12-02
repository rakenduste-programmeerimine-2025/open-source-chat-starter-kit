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

function sortAsc(a: Msg, b: Msg) {
    return (
        new Date(a.sent_on || 0).getTime() - new Date(b.sent_on || 0).getTime()
    );
}

export default function MessagesPanel({
    serverId,
    initialItems,
}: {
    serverId: string;
    initialItems: Msg[];
}) {
    // держим сообщения по возрастанию времени
    const [items, setItems] = useState<Msg[]>(
        [...initialItems].sort(sortAsc)
    );
    const [loadingMore, setLoadingMore] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);

    // автоскролл к низу при первом рендере
    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, []);

    // realtime INSERT
    useEffect(() => {
        const supabase = createBrowserSupabaseClient();

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
                    console.log("[RT] INSERT payload:", payload); // диагностика
                    const m = payload.new as unknown as Msg;

                    setItems((prev) => {
                        // защита от дублей
                        const exists = prev.some((x) => x.id === m.id);
                        const next = exists ? prev : [...prev, m];
                        next.sort(sortAsc);
                        return next;
                    });

                    // прокрутка вниз
                    queueMicrotask(() => {
                        listRef.current?.scrollTo({
                            top: listRef.current.scrollHeight,
                            behavior: "smooth",
                        });
                    });
                }
            )
            .subscribe((status) => {
                console.log("[RT] channel status:", status); // ожидаем "SUBSCRIBED"
            });

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
                // объединяем и удаляем дубли
                const merged = [...json.items, ...prev];
                const dedup = Array.from(new Map(merged.map((m) => [m.id, m])).values());
                dedup.sort(sortAsc);
                return dedup;
            });
        } catch (e) {
            console.error("[messages] loadOlder error:", e);
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Load older */}
            <div className="mb-3 flex justify-center">
                <button
                    onClick={loadOlder}
                    disabled={loadingMore}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
                >
                    {loadingMore ? "Loading…" : "Load older"}
                </button>
            </div>

            {/* scrollable list */}
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
                            {m.message && (
                                <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                                    {m.message}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
