import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export async function GET(request: NextRequest, { params }) {
  const UserParam = await params
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  let user

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].id === UserParam.user_id) {
      user = data.users[i]
      break
    }
  }

  user.email_change_sent_at_date = convertTimestamp(user?.email_confirmed_at)
  user.confirmed_at_date = convertTimestamp(user?.confirmed_at)
  user.last_sign_in_at_date = convertTimestamp(user?.last_sign_in_at)
  user.created_at_date = convertTimestamp(user?.created_at)
  user.updated_at_date = convertTimestamp(user?.updated_at)

  return new Response(JSON.stringify(user), {
    headers: { "Content-Type": "application/json" },
  })
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
