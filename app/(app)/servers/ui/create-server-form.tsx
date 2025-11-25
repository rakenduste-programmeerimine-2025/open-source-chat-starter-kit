"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * Minimal inline create server form (no action hook yet).
 */
export default function CreateServerForm() {
    return (
        <form className="flex items-end gap-2">
            <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="My server" required />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="image_url">Image URL</Label>
                <Input id="image_url" name="image_url" placeholder="https://…" />
            </div>
            <Button type="submit">Create</Button>
        </form>
    );
}
