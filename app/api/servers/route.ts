import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export async function GET(request: NextRequest) {
  const { data, error } = await supabase.from("servers").select()

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

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (body.name && body.created_by) {
    const { error } = await supabase.from("servers").insert({
      name: body.name,
      created_by: body.created_by,
    })
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } else {
    return new Response(
      JSON.stringify("ERROR: name, created_by MUST BE PRESENT"),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const deletable_server = await supabase
    .from("servers")
    .select()
    .eq("id", body.server_id)
  if (!deletable_server.data[0]) {
    return new Response(JSON.stringify("ERROR: Server not found"), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
  if (body.deleter_id && body.server_id) {
    if (deletable_server.data[0].created_by === body.deleter_id) {
      const { error } = await supabase
        .from("servers")
        .delete()
        .eq("id", body.server_id)
      return new Response(JSON.stringify("Deleted server"), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } else {
      return new Response(
        JSON.stringify("deleter_id and created_by MUST MATCH"),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } else {
    return new Response(
      JSON.stringify("ERROR: deleter_id, server_id MUST BE PRESENT"),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }
}
