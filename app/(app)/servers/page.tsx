import Link from "next/link";
import { redirect } from "next/navigation";
import { createRSCClient } from "@/lib/supabase/server-rsc";
import CreateServerForm from "./ui/create-server-form";
import DeleteServerButton from "./ui/delete-server-button";

type ServerRow = {
    id: string;
    name: string;
    image_url: string | null;
    created_at: string;
    created_by: string;
};

export default async function ServersPage() {
    const supabase = createRSCClient();

    // auth
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) redirect("/auth/login");
    const meId = userData.user.id;

    // servers where I have access (RLS will filter)
    const { data, error } = await supabase
        .from("servers")
        .select("id, name, image_url, created_at, created_by")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    const servers = (data ?? []) as ServerRow[];

    return (
        <main className="mx-auto max-w-2xl p-6 space-y-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Servers</h1>
                <CreateServerForm />
            </header>

            <ul className="grid gap-3">
                {servers.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                        You don’t belong to any servers yet.
                    </li>
                ) : (
                    servers.map((s) => {
                        const isOwner = s.created_by === meId;

                        return (
                            <li key={s.id} className="flex items-center gap-3 rounded-xl border p-4">
                                <div className="size-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                                    {s.image_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={s.image_url} alt={s.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-medium">
                                            {s.name.slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/servers/${s.id}`}
                                        className="font-medium underline-offset-2 hover:underline block truncate"
                                        title={s.name}
                                    >
                                        {s.name}
                                    </Link>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(s.created_at).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/servers/${s.id}/edit`}
                                        className="text-sm underline underline-offset-2 hover:text-primary"
                                    >
                                        Edit
                                    </Link>
                                    {isOwner && (
                                        <DeleteServerButton id={s.id} name={s.name} />
                                    )}
                                </div>
                            </li>
                        );
                    })
                )}
            </ul>
        </main>
    );
}
