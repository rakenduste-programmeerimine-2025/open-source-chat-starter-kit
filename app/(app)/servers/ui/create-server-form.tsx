"use client";

import { useState, useTransition } from "react";
import { createServerAction } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Inline create server form wired to server action.
 */
export default function CreateServerForm() {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    return (
        <form
            action={(formData) => {
                setError(null);
                startTransition(async () => {
                    try {
                        await createServerAction(formData);
                        // optional: reset form fields
                        const form = document.activeElement
                            ? (document.activeElement as HTMLElement).closest("form")
                            : null;
                        form?.reset?.();
                    } catch (e: unknown) {
                        const msg = e instanceof Error ? e.message : "Failed to create server";
                        setError(msg);
                    }
                });
            }}
            className="flex items-end gap-2"
        >
            <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="My server" required />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" placeholder="https://…" />
            </div>
            <Button type="submit" disabled={pending}>
                {pending ? "Creating…" : "Create"}
            </Button>
            {error && <p className="text-sm text-red-600 ml-2">{error}</p>}
        </form>
    );
}
