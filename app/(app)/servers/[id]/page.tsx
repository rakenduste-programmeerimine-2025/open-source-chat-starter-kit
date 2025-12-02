import { notFound, redirect } from "next/navigation";
import { createRSCClient } from "@/lib/supabase/server-rsc";
import MembersList from "./ui/members-list";
import AddMemberForm from "./ui/add-member-form";
import MessagesList from "./ui/messages-list";
import PostMessageForm from "./ui/post-message-form";
import MessagesPanel from "./ui/messages-panel";


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

    // initial messages for MessagesPanel
    const { data: initialItems } = await supabase
        .from("messages")
        .select("id, server_id, sender_id, message, sent_on")
        .eq("server_id", serverId)
        .order("sent_on", { ascending: false })
        .limit(30);


    return (
        <main className="flex min-h-screen w-full max-w-none p-4 md:p-6">
            {/* two-column responsive layout: left = info, right = chat */}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-[340px,1fr]">
                {/* LEFT SIDEBAR */}
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

                        <div className="flex flex-wrap gap-3">
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

                    {/* invite by user id */}
                    <section className="rounded-xl border p-4">
                        <h2 className="mb-3 text-sm font-semibold">Invite member</h2>
                        <AddMemberForm serverId={data.id} />
                    </section>

                    {/* members list */}
                    <section className="rounded-xl border p-4">
                        <h2 className="mb-3 text-sm font-semibold">Members</h2>
                        <MembersList serverId={data.id} />
                    </section>
                </aside>

                {/* RIGHT COLUMN: chat */}
                <section className="flex min-h-0 flex-col rounded-xl border">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Chat</h2>
                    </div>

                    {/* scrollable messages area */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        <div className="mx-auto max-w-2xl">
                            <MessagesList serverId={data.id} />
                        </div>
                    </div>

                    {/*  message input */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        <MessagesPanel serverId={data.id} initialItems={(initialItems ?? []).reverse()} />
                    </div>

                </section>
            </div>
        </main>
    );


}
