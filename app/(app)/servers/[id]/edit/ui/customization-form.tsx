"use client";

import { useTransition, useState } from "react";
import { upsertServerSettingsAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
    serverId: string;
    initial: {
        show_user: "nickname" | "id";
        timestamp_format: string;
        background_color: string; // chat column
        page_bg?: string;          // page colour
        message_density: "compact" | "normal";
        message_bg?: string;       // message window colour
        message_text?: string;     // message text colour
    };
};

export default function CustomizationForm({ serverId, initial }: Props) {
    const [pending, start] = useTransition();
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    return (
        <form
            action={(fd) => {
                setErr(null);
                setOk(false);
                start(async () => {
                    try {
                        await upsertServerSettingsAction(serverId, fd);
                        setOk(true);
                    } catch (e: unknown) {
                        setErr(e instanceof Error ? e.message : "Failed to save settings");
                    }
                });
            }}
            className="grid gap-4"
        >
            {/* Show user */}
            <div className="grid gap-1.5">
                <Label htmlFor="show_user">Show user</Label>
                <select
                    id="show_user"
                    name="show_user"
                    defaultValue={initial.show_user}
                    className="h-9 rounded-md border px-3 text-sm"
                >
                    <option value="nickname">Nickname</option>
                    <option value="id">ID</option>
                </select>
            </div>

            {/* Timestamp format */}
            <div className="grid gap-1.5">
                <Label htmlFor="timestamp_format">Timestamp format</Label>
                {/* defaultValue, not value */}
                <Input
                    id="timestamp_format"
                    name="timestamp_format"
                    placeholder="YYYY-MM-DD HH:mm"
                    defaultValue={initial.timestamp_format}
                />
                <p className="text-xs text-muted-foreground">
                    Examples: <code>YYYY-MM-DD HH:mm</code>, <code>HH:mm</code>, <code>HH:mm:ss</code>
                </p>
            </div>

            {/* Message density */}
            <div className="grid gap-1.5">
                <Label htmlFor="message_density">Message density</Label>
                <select
                    id="message_density"
                    name="message_density"
                    defaultValue={initial.message_density}
                    className="h-9 rounded-md border px-3 text-sm"
                >
                    <option value="normal">Normal</option>
                    <option value="compact">Compact</option>
                </select>
            </div>

            {/* Backgrounds & colors */}
            <div className="grid gap-1.5">
                <Label htmlFor="background_color">Chat column background</Label>
                <Input
                    id="background_color"
                    name="background_color"
                    type="color"
                    defaultValue={initial.background_color}
                />
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="page_bg">Full page background</Label>
                <Input
                    id="page_bg"
                    name="page_bg"
                    type="color"
                    defaultValue={initial.page_bg ?? "#ffffff"}
                />
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="message_bg">Message card background</Label>
                <Input
                    id="message_bg"
                    name="message_bg"
                    type="color"
                    defaultValue={initial.message_bg ?? "#ffffff"}
                />
            </div>

            <div className="grid gap-1.5">
                <Label htmlFor="message_text">Message text color</Label>
                <Input
                    id="message_text"
                    name="message_text"
                    type="color"
                    defaultValue={initial.message_text ?? "#111827"}
                />
            </div>

            {/* buttons and status*/}
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Save"}
                </Button>
                {ok && <span className="text-xs text-green-600">Saved</span>}
                {err && <span className="text-xs text-red-600">{err}</span>}
            </div>
        </form>
    );
}
