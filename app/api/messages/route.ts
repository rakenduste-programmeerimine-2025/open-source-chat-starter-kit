import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export async function POST(request: NextRequest) {
  const body = await request.json()
  if (body.server_id && body.sender_id && body.message) {
    const { error } = await supabase.from("messages").insert({
      server_id: body.server_id,
      sender_id: body.sender_id,
      message: body.message,
    })
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } else {
    return new Response(
      JSON.stringify("ERROR: server_id, sender_id, message MUST BE PRESENT"),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function GET(request: NextRequest) {
  //   const body = await request.json()
  //   if (body.server_id) {
  //     const { data, error } = supabase.from("messages").select().eq(id, server_id)
  //   } else {
  const users = await getUsers()

  const { data, error } = await supabase.from("messages").select("*")

  for (let i = 0; i < data?.length; i++) {
    data[i].username = users.find(
      user => user.id === data[i].sender_id,
    ).username
  }

  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}

async function getUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  const users = (data?.users || []).map(user => ({
    id: user.id,
    username: user.user_metadata?.username || null, // or raw_user_meta_data if available
  }))
  return users
}
