import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Baseline /servers page with auth guard.
 */
export default async function ServersPage() {
    const supabase = createClient();

    // Authenticate the user (server-side, secure)
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
        redirect("/auth/login");
    }

    return (
        <main className="mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-semibold">Servers</h1>
            {/* List and create form will be added next */}
        </main>
    );
}
