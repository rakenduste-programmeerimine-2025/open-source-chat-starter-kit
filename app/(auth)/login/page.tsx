'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        const errorDescription = params.get('error_description')

        if (hash.includes('access_token') || params.get('type') === 'magiclink') {
            window.history.replaceState({}, document.title, '/login')
        }

        if (errorDescription) {
            setError(errorDescription)
        }
    }, [])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSent(false)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: 'http://localhost:3000/callback',
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        setSent(true)
        setLoading(false)
    }

    if (sent) {
        return (
            <main className="max-w-sm mx-auto mt-10 space-y-4 text-center">
                <h1 className="text-xl font-semibold">Check your email</h1>
                <p>
                    We sent a magic link to{' '}
                    <span className="font-medium">{email}</span>. Please check your inbox.
                </p>
            </main>
        )
    }

    return (
        <main className="max-w-sm mx-auto mt-10 space-y-4">
            <h1 className="text-xl font-semibold text-center">Sign in</h1>

            {error && (
                <p className="text-sm text-red-600 text-center">
                    {error}
                </p>
            )}

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
                    disabled={loading || !email}
                    className="border px-3 py-2 rounded w-full hover:bg-gray-100 disabled:opacity-50"
                >
                    {loading ? 'Sending…' : 'Send magic link'}
                </button>
            </form>
        </main>
    )
}
