import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Params = { params: { id: string } };

/**
 * Loads a server by id (RLS: only members can read).
 */
export default async function EditServerPage({ params }: Params) {
    const serverId = params.id;
    const supabase = createClient();

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const { data, error } = await supabase
        .from("servers")
        .select("id, name, image_url, created_at")
        .eq("id", serverId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) notFound();

    return (
        <main className="mx-auto max-w-2xl p-6">
            <h1 className="text-2xl font-semibold">Edit server</h1>
            <pre className="text-xs text-muted-foreground mt-4">
                {JSON.stringify(data, null, 2)}
            </pre>
        </main>
    );
}
