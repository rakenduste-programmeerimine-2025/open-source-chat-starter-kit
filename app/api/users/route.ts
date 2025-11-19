import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export async function GET(request: NextRequest) {
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const users = (data?.users || []).map(user => ({
    id: user.id,
    email: user.email,
    username: user.user_metadata?.username || null, // or raw_user_meta_data if available
  }))

  return new Response(JSON.stringify({ users }), {
    headers: { "Content-Type": "application/json" },
  })
}
