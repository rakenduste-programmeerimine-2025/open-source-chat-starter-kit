"use client";

import { useState, useTransition } from "react";
import { updateServerAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
    serverId: string;
    defaultName: string;
    defaultImageUrl: string | null;
};

/**
 * Edit form wired to server action.
 */
export default function EditServerForm({
    serverId,
    defaultName,
    defaultImageUrl,
}: Props) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            action={(formData) => {
                setError(null);
                startTransition(async () => {
                    try {
                        await updateServerAction(serverId, formData);
                    } catch (e: unknown) {
                        const msg = e instanceof Error ? e.message : "Failed to update server";
                        setError(msg);
                    }
                });
            }}
            className="space-y-4 max-w-md"
        >
            <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={defaultName} required />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={defaultImageUrl ?? ""}
                    placeholder="https://…"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Save changes"}
                </Button>
            </div>
        </form>
    );
}
