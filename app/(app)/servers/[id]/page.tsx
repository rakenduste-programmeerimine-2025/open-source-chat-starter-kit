import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddMemberForm from "./ui/add-member-form";
import MembersList from "./ui/members-list";
import MessagesList from "./ui/messages-list";
import PostMessageForm from "./ui/post-message-form";

export default async function ServerViewPage({
    params,
}: {
    params: { id: string };
}) {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) redirect("/auth/login");

    const serverId = params.id;

    // Получаем сервер и проверяем, что пользователь является участником
    const { data, error } = await supabase
        .from("servers")
        .select("*")
        .eq("id", serverId)
        .single();

    if (error) throw new Error(error.message);
    if (!data) notFound();

    // Проверяем, что пользователь участник этого сервера
    const { data: memberRow } = await supabase
        .from("server_members")
        .select("role")
        .eq("server_id", serverId)
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (!memberRow) {
        throw new Error(
            `not a member: user=${userData.user.id} server=${serverId} (RLS blocking access)`
        );
    }

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

                    {/* add by user_id */}
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

                {/* chat*/}
                <section className="flex min-h-[80vh] md:min-h-[85vh] flex-col rounded-xl border">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Chat</h2>
                    </div>

                    {/* messages list*/}
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
