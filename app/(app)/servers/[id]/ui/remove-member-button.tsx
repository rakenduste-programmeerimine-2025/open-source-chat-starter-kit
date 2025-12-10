"use client";

import { useTransition, useState } from "react";
import { removeMemberAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function RemoveMemberButton({
    serverId,
    memberUserId,
}: {
    serverId: string;
    memberUserId: string;
}) {
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={pending}>
                    {pending ? "Removing…" : "Remove"}
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remove this member?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove this member from the server?
                        <br />
                        <span className="font-mono text-xs text-muted-foreground">
                            {memberUserId}
                        </span>
                        <br />
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-700"
                        disabled={pending}
                        onClick={() => {
                            setError(null);
                            start(async () => {
                                try {
                                    await removeMemberAction(serverId, memberUserId);
                                    setOpen(false);
                                } catch (e: unknown) {
                                    setError(
                                        e instanceof Error ? e.message : "Failed to remove member"
                                    );
                                }
                            });
                        }}
                    >
                        {pending ? "Removing…" : "Remove"}
                    </AlertDialogAction>
                </AlertDialogFooter>

                {error && (
                    <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
                )}
            </AlertDialogContent>
        </AlertDialog>
    );
}
