"use client";

import { useState, useTransition } from "react";
import { postMessageAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PostMessageForm({ serverId }: { serverId: string }) {
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            action={(fd) => {
                setError(null);
                start(async () => {
                    try {
                        await postMessageAction(serverId, fd);
                        const form = document.activeElement
                            ? (document.activeElement as HTMLElement).closest("form")
                            : null;
                        form?.reset?.();
                    } catch (e: unknown) {
                        setError(e instanceof Error ? e.message : "Failed to send message");
                    }
                });
            }}
            className="flex items-end gap-2"
        >
            <div className="flex-1">
                <Input
                    name="content"
                    placeholder="Write a message…"
                    required
                    disabled={pending}
                />
            </div>
            <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send"}
            </Button>
            {error && <span className="text-sm text-red-600">{error}</span>}
        </form>
    );
}
