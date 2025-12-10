"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { deleteServerAction } from "../actions";

/**
 * DeleteServerButton — кнопка удаления сервера с красивым подтверждением.
 * Использует AlertDialog из shadcn/ui вместо window.confirm.
 */
export default function DeleteServerButton({
    id,
    name,
}: {
    id: string;
    name: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        try {
            setLoading(true);
            await deleteServerAction(id);
            setOpen(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-20">
                    Delete
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete server “{name}”?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        the server and all its data.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
