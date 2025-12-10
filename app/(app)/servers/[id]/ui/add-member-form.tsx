"use client";

import { useState, useTransition } from "react";
import { addMemberAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AddMemberForm({ serverId }: { serverId: string }) {
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"nickname" | "uuid">("nickname");

    return (
        <div className="space-y-3">
            {/* id or nickname */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={mode === "nickname" ? "default" : "outline"}
                    onClick={() => setMode("nickname")}
                    disabled={pending}
                >
                    By nickname
                </Button>
                <Button
                    type="button"
                    variant={mode === "uuid" ? "default" : "outline"}
                    onClick={() => setMode("uuid")}
                    disabled={pending}
                >
                    By UUID
                </Button>
            </div>

            {/* add form */}
            <form
                action={(fd) => {
                    setError(null);
                    start(async () => {
                        try {
                            const form = document.activeElement
                                ? (document.activeElement as HTMLElement).closest("form")
                                : null;


                            fd.append("mode", mode);

                            await addMemberAction(serverId, fd);
                            form?.reset?.();
                        } catch (e: unknown) {
                            setError(
                                e instanceof Error ? e.message : "Failed to add member"
                            );
                        }
                    });
                }}
                className="flex items-end gap-2"
            >
                <div className="space-y-1.5 flex-1">
                    <Label htmlFor="user_input">
                        {mode === "nickname" ? "User nickname" : "User ID"}
                    </Label>
                    <Input
                        id="user_input"
                        name={mode === "nickname" ? "nickname" : "user_id"}
                        placeholder={
                            mode === "nickname" ? "nickname (display_name)" : "uuid-of-user"
                        }
                        required
                    />
                </div>

                <Button type="submit" disabled={pending}>
                    {pending ? "Adding…" : "Add"}
                </Button>
            </form>

            {error && <span className="text-sm text-red-600 block">{error}</span>}
        </div>
    );
}
