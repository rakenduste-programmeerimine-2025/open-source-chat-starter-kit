import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export async function GET(request: NextRequest, { params }) {
  const serverParam = await params
  const server_id = serverParam.server_id

  const { data, error } = await supabase
    .from("servers")
    .select()
    .eq("id", server_id)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  // console.log(data)
  const servers = (data || []).map(server => ({
    id: server.id,
    name: server.name,
    image_url: server.image_url,
    created_by: server.created_by,
    created_at: server.created_at,
  }))

  return new Response(JSON.stringify(servers), {
    headers: { "Content-Type": "application/json" },
  })
}

