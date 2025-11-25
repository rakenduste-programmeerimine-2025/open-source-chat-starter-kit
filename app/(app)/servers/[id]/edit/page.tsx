import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Baseline edit page with auth guard.
 */
export default async function EditServerPage() {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <main className="mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-semibold">Edit server</h1>
            { }
        </main>
    );
}
