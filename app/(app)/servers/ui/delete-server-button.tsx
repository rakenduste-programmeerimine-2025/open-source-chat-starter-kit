"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function DeleteServerButton({
    id,
    name,
}: {
    id: string;
    name?: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        try {
            setLoading(true);
            await deleteServerAction(id); // <-- передаем ID напрямую
            setOpen(false);
            router.refresh();             // мгновенно обновляем список на /servers
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                {/* НЕ submit-кнопка, просто обычная */}
                <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete server{name ? ` “${name}”` : ""}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. It will permanently remove the server and all associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                    {/* ВАЖНО: type="button", чтобы НЕ сабмитить родительскую форму */}
                    <AlertDialogAction
                        type="button"
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
