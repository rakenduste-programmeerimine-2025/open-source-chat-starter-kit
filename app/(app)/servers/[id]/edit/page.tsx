import Link from "next/link";
import { redirect } from "next/navigation";
import { createRSCClient } from "@/lib/supabase/server-rsc";
import { getServerSettings } from "../actions";
import CustomizationForm from "./ui/customization-form";
import EditServerForm from "../ui/edit-server-form";

type RouteParams = { id: string };

export default async function EditServerPage({
    params,
}: {
    params: Promise<RouteParams>;
}) {
    const { id: serverId } = await params;

    const supabase = createRSCClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) redirect("/auth/login");

    const { data: server, error } = await supabase
        .from("servers")
        .select("id,name,image_url,created_at")
        .eq("id", serverId)
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!server) redirect("/servers");

    const settings = await getServerSettings(serverId);

    return (
        <main className="mx-auto max-w-3xl p-6 space-y-6">
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Edit server</h1>
                    <p className="text-sm text-muted-foreground">
                        Server: <span className="font-medium">{server.name}</span>
                    </p>
                </div>
                <Link
                    href={`/servers/${server.id}`}
                    className="text-sm underline underline-offset-2 hover:text-primary"
                >
                    ← Back to server
                </Link>
            </header>

            {/* General settings */}
            <section className="rounded-xl border p-4">
                <h2 className="mb-3 text-sm font-semibold">General</h2>
                <EditServerForm
                    serverId={server.id}
                    initialName={server.name}
                    initialImageUrl={server.image_url}
                />
            </section>

            {/* Customization */}
            <section className="rounded-xl border p-4">
                <h2 className="mb-3 text-sm font-semibold">Customization</h2>
                <CustomizationForm serverId={server.id} initial={settings} />
            </section>
        </main>
    );
}
