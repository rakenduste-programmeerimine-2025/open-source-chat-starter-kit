'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type User = {
    email?: string
}

export default function MePage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                router.replace('/login')
                return
            }

            setUser(user)
            setLoading(false)
        }

        checkUser()
    }, [router])

    if (loading) {
        return (
            <main className="max-w-sm mx-auto mt-10 text-center">
                <p>Loading…</p>
            </main>
        )
    }

    return (
        <main className="max-w-sm mx-auto mt-10 text-center space-y-2">
            <h1 className="text-xl font-semibold">Private page</h1>
            <p>Welcome, {user?.email}</p>
            <button
                className="mt-4 border px-3 py-2 rounded"
                onClick={async () => {
                    await supabase.auth.signOut()
                    router.replace('/login')
                }}
            >
                Log out
            </button>
        </main>
    )
}
