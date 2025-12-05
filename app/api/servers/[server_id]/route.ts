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

  const users = await getUsers()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  for (let i = 0; i < data?.length; i++) {
    data[i].created_by_username = users.find(
      user => user.id === data[i].created_by,
    ).username
  }

  // console.log(data)
  const servers = (data || []).map(server => ({
    id: server.id,
    name: server.name,
    image_url: server.image_url,
    created_by: server.created_by,
    created_by_username: server.created_by_username,
    created_at: server.created_at,
    date: convertTimestamp(server.created_at),
  }))

  return new Response(JSON.stringify(servers), {
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

function convertTimestamp(timestamp) {
  const date = new Date(timestamp)
  const returnDate = {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
  }
  return returnDate
}
