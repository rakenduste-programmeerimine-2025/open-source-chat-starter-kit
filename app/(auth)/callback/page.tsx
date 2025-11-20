'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)

        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        console.log('CALLBACK HASH:', hash)
        console.log('TOKENS:', { access_token, refresh_token })

        if (access_token && refresh_token) {
            supabase.auth
                .setSession({ access_token, refresh_token })
                .then(({ error }) => {
                    console.log('setSession result, error =', error)
                    if (error) {
                        console.error('setSession error', error)
                        router.replace('/login')
                    } else {
                        router.replace('/me')
                    }
                })
        } else {
            console.warn('NO TOKENS IN CALLBACK, redirecting to /login')
            router.replace('/login')
        }
    }, [router])

    return (
        <main className="text-center mt-10">
            <p>Signing you in…</p>
        </main>
    )
}
