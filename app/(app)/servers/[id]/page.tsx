import { notFound, redirect } from "next/navigation";
import { createRSCClient } from "@/lib/supabase/server-rsc";
import MembersList from "./ui/members-list";
import AddMemberForm from "./ui/add-member-form";
import MessagesList from "./ui/messages-list";
import PostMessageForm from "./ui/post-message-form";


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
        <main className="w-full min-h-screen max-w-none p-4 md:p-6">
            {/* 2 columns */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[340px,1fr] h-full">
                {/* left column */}
                <aside className="space-y-6">
                    {/* server info */}
                    <section className="rounded-xl border p-4">
                        <header className="mb-3 flex items-center gap-3">
                            {data.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={data.image_url}
                                    alt={data.name}
                                    className="h-12 w-12 rounded-lg border object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg border text-sm">
                                    {data.name.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h1 className="text-lg font-semibold">{data.name}</h1>
                                <p className="text-xs text-muted-foreground">
                                    Created:{" "}
                                    {data.created_at
                                        ? new Date(data.created_at).toLocaleString()
                                        : "-"}
                                </p>
                            </div>
                        </header>

                        <div className="flex gap-3">
                            <a
                                className="text-sm underline underline-offset-2 hover:text-blue-600"
                                href={`/servers/${data.id}/edit`}
                            >
                                Edit
                            </a>
                            <a
                                className="text-sm underline underline-offset-2 hover:text-blue-600"
                                href={`/servers`}
                            >
                                Back
                            </a>
                        </div>
                    </section>

                    {/* add user by user_id */}
                    <section className="rounded-xl border p-4">
                        <h2 className="mb-3 text-sm font-semibold">Invite member</h2>
                        <AddMemberForm serverId={data.id} />
                    </section>

                    {/* member list */}
                    <section className="rounded-xl border p-4">
                        <h2 className="mb-3 text-sm font-semibold">Members</h2>
                        <MembersList serverId={data.id} />
                    </section>
                </aside>

                {/* right column chat */}
                <section className="flex min-h-[80vh] md:min-h-[85vh] flex-col rounded-xl border">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Chat</h2>
                    </div>

                    {/* messages list */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        <div className="mx-auto max-w-2xl">
                            <MessagesList serverId={data.id} />
                        </div>
                    </div>

                    {/* send form */}
                    <div className="border-t p-4">
                        <div className="mx-auto max-w-2xl">
                            <PostMessageForm serverId={data.id} />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );

}
