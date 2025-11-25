import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateServerForm from "./ui/create-server-form";


type ServerRow = {
    id: string;
    name: string;
    image_url: string | null;
    created_at: string;
};

/**
 * Servers list (RLS ensures only member servers are returned).
 */
export default async function ServersPage() {
    const supabase = createClient();

    // authenticate user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) redirect("/auth/login");

    // fetch servers where user is a member (RLS will filter)
    const { data, error } = await supabase
        .from("servers")
        .select("id,name,image_url,created_at")
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
                    servers.map((s) => (
                        <li
                            key={s.id}
                            className="border rounded-xl p-4 flex items-center gap-3"
                        >
                            <div className="size-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                                {s.image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={s.image_url}
                                        alt={s.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-medium">
                                        {s.name.slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">{s.name}</div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(s.created_at).toLocaleString()}
                                </div>
                            </div>
                            <a
                                href={`/servers/${s.id}/edit`}
                                className="text-sm underline"
                            >
                                Edit
                            </a>
                        </li>
                    ))
                )}
            </ul>
        </main>
    );
}
