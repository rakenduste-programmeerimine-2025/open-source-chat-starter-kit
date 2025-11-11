'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
    const [email, setEmail] = useState('')

    return (
        <main className="max-w-sm mx-auto mt-10 space-y-4">
            <h1 className="text-xl font-semibold text-center">Sign in</h1>
            <form className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border rounded p-2"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    type="submit"
                    className="border px-3 py-2 rounded w-full hover:bg-gray-100"
                >
                    Send magic link
                </button>
            </form>
        </main>
    )
}
