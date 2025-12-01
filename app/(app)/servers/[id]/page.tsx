import { notFound, redirect } from "next/navigation";
import { createRSCClient } from "@/lib/supabase/server-rsc";
import MembersList from "./ui/members-list";

type RouteParams = { id: string };

export default async function ServerViewPage({
    params,
}: {
    params: Promise<RouteParams>;
}) {
    const { id: serverId } = await params;

    const supabase = createRSCClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) redirect("/auth/login");

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
                <h1 className="text-2xl font-semibold">{data.name}</h1>
                <div className="flex items-center gap-2">
                    <a className="text-sm underline" href={`/servers/${data.id}/edit`}>
                        Edit
                    </a>
                    <a className="text-sm underline" href={`/servers`}>
                        Back
                    </a>
                </div>
            </header>

            <section className="space-y-2">
                {data.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={data.image_url}
                        alt={data.name}
                        className="w-full max-w-md rounded-xl border object-cover"
                    />
                ) : (
                    <div className="w-full max-w-md rounded-xl border p-6 text-sm text-muted-foreground">
                        No image provided.
                    </div>
                )}
                <p className="text-xs text-muted-foreground">
                    Created at: {new Date(data.created_at).toLocaleString()}
                </p>
            </section>
            <section className="space-y-3">
                <h2 className="text-lg font-semibold">Members</h2>
                <MembersList serverId={data.id} />
            </section>
        </main>
    );
}
