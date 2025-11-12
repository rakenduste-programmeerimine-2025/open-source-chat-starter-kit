import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function createSupabaseServerClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name: string) => cookieStore.get(name)?.value,

                set: (_name: string, _value: string, _options: CookieOptions) => {
                    try {
                        void _name; void _value; void _options
                    } catch { }
                },

                remove: (_name: string, _options: CookieOptions) => {
                    try {
                        void _name; void _options
                    } catch { }
                },
            },
        }
    )
}
