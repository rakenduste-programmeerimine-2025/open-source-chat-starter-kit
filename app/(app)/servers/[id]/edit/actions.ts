"use server";

/**
 * Parses input for updating a server.
 * No side effects yet — DB/auth will be added next.
 */
export async function updateServerAction(serverId: string, formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const imageUrlRaw = String(formData.get("image_url") ?? "").trim();
    const image_url = imageUrlRaw.length > 0 ? imageUrlRaw : null;

    if (!serverId) {
        throw new Error("Missing server id");
    }
    if (!name) {
        throw new Error("Server name is required");
    }

    return { ok: true, name, image_url };
}
