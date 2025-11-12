import { createSupabaseServerClient } from '@/lib/supabaseServer'

export default async function MePage() {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <main className="max-w-sm mx-auto mt-10 text-center space-y-4">
            <h1 className="text-xl font-semibold">Hello, {user?.email}</h1>
            <p>Welcome to your private page.</p>
            <a className="underline" href="/login">Back to login</a>
        </main>
    )
}
