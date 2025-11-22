import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const supabase = await createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export async function GET(request: NextRequest, { params }) {
  const serverParam = await params
  const server_id = serverParam.server_id
  const users = await getUsers()

  // console.log(server_id)
  const { data, error } = await supabase
    .from("messages")
    .select()
    .eq("server_id", server_id)
  if (!data) {
    return new Response(JSON.stringify("ERROR: Server not found"), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  } else {
    for (let i = 0; i < data?.length; i++) {
    data[i].username = users.find(
      user => user.id === data[i].sender_id,
    ).username
  }
    return new Response(JSON.stringify({data}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}


async function getUsers() {
  const { data, error } = await supabase.auth.admin.listUsers()
  const users = (data?.users || []).map(user => ({
    id: user.id,
    username: user.user_metadata?.username || null, // or raw_user_meta_data if available
  }))
  return users
}
