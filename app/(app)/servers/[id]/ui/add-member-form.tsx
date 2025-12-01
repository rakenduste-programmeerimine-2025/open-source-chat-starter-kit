"use client";

import { useState, useTransition } from "react";
import { addMemberAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AddMemberForm({ serverId }: { serverId: string }) {
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            action={(fd) => {
                setError(null);
                start(async () => {
                    try {
                        await addMemberAction(serverId, fd);
                        // optional: reset input
                        const form = document.activeElement
                            ? (document.activeElement as HTMLElement).closest("form")
                            : null;
                        form?.reset?.();
                    } catch (e: unknown) {
                        setError(e instanceof Error ? e.message : "Failed to add member");
                    }
                });
            }}
            className="flex items-end gap-2"
        >
            <div className="space-y-1.5">
                <Label htmlFor="user_id">User ID</Label>
                <Input id="user_id" name="user_id" placeholder="uuid-of-user" required />
            </div>
            <Button type="submit" disabled={pending}>
                {pending ? "Adding…" : "Add"}
            </Button>
            {error && <span className="text-sm text-red-600">{error}</span>}
        </form>
    );
}
