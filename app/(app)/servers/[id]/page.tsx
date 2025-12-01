type RouteParams = { id: string };

export default async function ServerViewPage({
    params,
}: {
    params: Promise<RouteParams>;
}) {
    const { id } = await params; // Next 15: unwrap
    return <main className="p-6">Server page for {id}</main>;
}
