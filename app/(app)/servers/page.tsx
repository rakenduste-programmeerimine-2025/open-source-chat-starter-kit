import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Baseline servers page (placeholder).
 */
export default async function ServersPage() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) redirect("/auth/login");

    return (
        <main className="mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-semibold">Servers</h1>
            <p className="mt-4 text-sm text-muted-foreground">
                Servers list coming soon.
            </p>
        </main>
    );
}
