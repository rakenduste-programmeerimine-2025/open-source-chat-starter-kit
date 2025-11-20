'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setSent(false)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // ВАЖНО: ведём на /callback, а не на /login
                emailRedirectTo: 'http://localhost:3000/callback',
            },
        })

        if (error) {
            alert(error.message)
            setLoading(false)
            return
        }

        setSent(true)
        setLoading(false)
    }

    if (sent) {
        return (
            <main className="max-w-sm mx-auto mt-10 text-center">
                <h1 className="text-xl font-semibold">Check your email</h1>
                <p>We sent you a magic link to sign in.</p>
            </main>
        )
    }

    return (
        <main className="max-w-sm mx-auto mt-10 space-y-4">
            <h1 className="text-xl font-semibold text-center">Sign in</h1>
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full border rounded p-2"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="border px-3 py-2 rounded w-full hover:bg-gray-100 disabled:opacity-50"
                >
                    {loading ? 'Sending…' : 'Send magic link'}
                </button>
            </form>
        </main>
    )
}
