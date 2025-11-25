import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditServerForm from "./ui/edit-server-form";

type RouteParams = { id: string };

export default async function EditServerPage({
    params,
}: {
    params: Promise<RouteParams>;
}) {
    const { id: serverId } = await params;

    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
        redirect("/auth/login");
    }
    const userId = session.user.id;

    const { data: memberRow, error: memberErr } = await supabase
        .from("server_members")
        .select("role")
        .eq("server_id", serverId)
        .eq("user_id", userId)
        .maybeSingle();

    if (memberErr) {
        throw new Error(`membership check failed: ${memberErr.message}`);
    }
    if (!memberRow) {
        throw new Error(
            `not a member: user=${userId} server=${serverId} (RLS is blocking SELECT on servers)`
        );
    }

    const { data, error } = await supabase
        .from("servers")
        .select("id, name, image_url, created_at")
        .eq("id", serverId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) notFound();

    return (
        <main className="mx-auto max-w-2xl p-6 space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit server</h1>
            </header>

            <EditServerForm
                serverId={data.id}
                defaultName={data.name}
                defaultImageUrl={data.image_url}
            />
        </main>
    );
}
