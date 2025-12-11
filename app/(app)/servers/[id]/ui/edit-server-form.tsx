"use client";

import { useTransition, useState } from "react";
import { updateServerAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
    serverId: string;
    initialName: string;
    initialImageUrl: string | null;
};

export default function EditServerForm({
    serverId,
    initialName,
    initialImageUrl,
}: Props) {
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            action={(fd) => {
                setError(null);
                start(async () => {
                    try {
                        await updateServerAction(serverId, fd);
                    } catch (e: unknown) {
                        setError(e instanceof Error ? e.message : "Failed to update server");
                    }
                });
            }}
            className="grid gap-4"
        >
            <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    defaultValue={initialName}
                    placeholder="Server name"
                />
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                    id="image_url"
                    name="image_url"
                    defaultValue={initialImageUrl ?? ""}
                    placeholder="https://…"
                />
                <p className="text-xs text-muted-foreground">
                    Leave empty to remove the image.
                </p>
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
