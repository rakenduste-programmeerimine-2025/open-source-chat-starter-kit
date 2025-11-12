'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallback() {
    const router = useRouter()

    useEffect(() => {
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
            supabase.auth.setSession({
                access_token,
                refresh_token,
            }).then(() => {
                router.replace('/me')
            })
        } else {
            router.replace('/login')
        }
    }, [router])

    return <p className="text-center mt-10">Signing you in...</p>
}
