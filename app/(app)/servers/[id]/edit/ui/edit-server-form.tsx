"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
    serverId: string;
    defaultName: string;
    defaultImageUrl: string | null;
};


export default function EditServerForm({
    defaultName,
    defaultImageUrl,
}: Props) {
    return (
        <form className="space-y-4 max-w-md">
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

            <div className="flex gap-2">
                <Button type="submit">Save changes</Button>
            </div>
        </form>
    );
}
