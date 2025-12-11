"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type Msg = {
    id: string;
    server_id: string;
    sender_id: string;
    message: string | null;
    sent_on: string | null;
};

type PanelSettings = {
    show_user: "nickname" | "id";
    timestamp_format: string;
    message_density: "compact" | "normal";
    message_bg?: string;
    message_text?: string;
};

const ts = (m: Msg) => new Date(m.sent_on || 0).getTime();
const sortAsc = (a: Msg, b: Msg) => ts(a) - ts(b);

export default function MessagesPanel({
    serverId,
    initialItems,
    settings,
}: {
    serverId: string;
    initialItems: Msg[];
    settings: PanelSettings;
}) {
    const [items, setItems] = useState<Msg[]>([...initialItems].sort(sortAsc));
    const listRef = useRef<HTMLDivElement>(null);
    const supabaseRef = useRef<ReturnType<typeof createBrowserSupabaseClient> | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // nickname cache
    const [names, setNames] = useState<Record<string, string>>({});

    const densityClasses = useMemo(
        () => (settings.message_density === "compact" ? "space-y-2 p-1" : "space-y-3 p-2"),
        [settings.message_density]
    );

    const cardStyle = useMemo(
        () => ({
            backgroundColor: settings.message_bg ?? "#ffffff",
            color: settings.message_text ?? "#111827",
        }),
        [settings.message_bg, settings.message_text]
    );

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

    // preload nicknames (if needed)
    useEffect(() => {
        if (settings.show_user !== "nickname") return;
        const supabase = (supabaseRef.current ??= createBrowserSupabaseClient());
        const ids = Array.from(new Set(items.map((i) => i.sender_id))).filter((id) => !names[id]);
        if (ids.length === 0) return;

        (async () => {
            const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);
            const map: Record<string, string> = {};
            for (const row of data ?? []) map[row.id] = row.display_name || row.id;
            setNames((prev) => ({ ...prev, ...map }));
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, settings.show_user]);

    // realtime INSERT
    useEffect(() => {
        const supabase = (supabaseRef.current ??= createBrowserSupabaseClient());

        const channel = supabase
            .channel(`messages:${serverId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `server_id=eq.${serverId}` },
                payload => {
                    const m = payload.new as Msg;
                    const stick = isNearBottom();
                    setItems(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m].sort(sortAsc)));
                    if (stick) requestAnimationFrame(() =>
                        requestAnimationFrame(() => scrollToBottom(true))
                    );
                }
            )
            .subscribe();


        return () => {
            void supabase.removeChannel(channel);
        };
    }, [serverId]);

    // polling 
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
                        const stick = isNearBottom();
                        setItems((prev) => {
                            const merged = [...prev, ...json.items];
                            const dedup = Array.from(new Map(merged.map((m) => [m.id, m])).values());
                            dedup.sort(sortAsc);
                            return dedup;
                        });

                        if (settings.show_user === "nickname") {
                            const supabase = (supabaseRef.current ??= createBrowserSupabaseClient());
                            const newIds = Array.from(new Set(json.items.map((i) => i.sender_id))).filter(
                                (id) => !names[id]
                            );
                            if (newIds.length > 0) {
                                const { data } = await supabase
                                    .from("profiles")
                                    .select("id, display_name")
                                    .in("id", newIds);
                                const map: Record<string, string> = {};
                                for (const row of data ?? []) map[row.id] = row.display_name || row.id;
                                setNames((prev) => ({ ...prev, ...map }));
                            }
                        }

                        if (stick) requestAnimationFrame(() => requestAnimationFrame(() => scrollToBottom(true)));
                    }
                } catch {
                    // ignore
                }
            }
            setTimeout(tick, 2000);
        }
        const t = setTimeout(tick, 2000);
        return () => {
            clearTimeout(t);
            stopped = true;
        };
    }, [serverId, items, settings.show_user, names]);

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

            if (settings.show_user === "nickname") {
                const supabase = (supabaseRef.current ??= createBrowserSupabaseClient());
                const ids = Array.from(new Set(json.items.map((i) => i.sender_id))).filter((id) => !names[id]);
                if (ids.length > 0) {
                    const { data } = await supabase.from("profiles").select("id, display_name").in("id", ids);
                    const map: Record<string, string> = {};
                    for (const row of data ?? []) map[row.id] = row.display_name || row.id;
                    setNames((prev) => ({ ...prev, ...map }));
                }
            }
        } finally {
            setLoadingMore(false);
        }
    }

    const renderUser = (m: Msg) => {
        return settings.show_user === "nickname" ? (names[m.sender_id] || m.sender_id) : m.sender_id;
    };

    const renderTime = (m: Msg) => {
        if (!m.sent_on) return "-";
        try {
            return dayjs(m.sent_on).format(settings.timestamp_format || "YYYY-MM-DD HH:mm");
        } catch {
            return new Date(m.sent_on).toLocaleString();
        }
    };

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
                <div className={`mx-auto max-w-2xl ${densityClasses}`}>
                    {items.map((m) => (
                        <div key={m.id} className="rounded-lg border p-3 shadow-sm" style={cardStyle}>
                            <div className="flex items-center justify-between">
                                <span className="max-w-[60%] truncate font-mono text-xs opacity-80" title={m.sender_id}>
                                    {renderUser(m)}
                                </span>
                                <span className="text-xs opacity-70">{renderTime(m)}</span>
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
