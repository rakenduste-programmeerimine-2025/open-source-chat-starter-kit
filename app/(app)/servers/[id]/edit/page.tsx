import { notFound, redirect } from "next/navigation";
import { createRSCClient } from "@/lib/supabase/server-rsc";
import EditServerForm from "./ui/edit-server-form";
import DeleteServerButton from "./ui/delete-server-button";


type RouteParams = { id: string };

export default async function EditServerPage({
    params,
}: {
    params: Promise<RouteParams>;
}) {
    const { id: serverId } = await params;

    const supabase = createRSCClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
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
        <main className="mx-auto max-w-2xl p-6 space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Edit server</h1>
                <DeleteServerButton serverId={data.id} />
            </header>

            <EditServerForm
                serverId={data.id}
                defaultName={data.name}
                defaultImageUrl={data.image_url}
            />
        </main>
    );
}
