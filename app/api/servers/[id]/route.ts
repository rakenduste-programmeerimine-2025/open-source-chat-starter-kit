import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();


  const { data, error } = await supabase
    .from("servers")
    .select("id, name, image_url, created_by, created_at")
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const servers = (data ?? []).map((server) => ({
    id: server.id,
    name: server.name,
    image_url: server.image_url,
    created_by: server.created_by,
    created_at: server.created_at,
  }));

  return NextResponse.json(servers);
}
