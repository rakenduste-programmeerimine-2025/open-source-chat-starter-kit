// lib/supabase/server.ts

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/** Minimal shape we need from Next.js cookie store */
type CookieStore = {
  get(name: string): { value: string } | undefined;
  set(args: { name: string; value: string } & CookieOptions): void;
};

/** Type guard: is the value a Promise? */
function isPromise<T>(v: unknown): v is Promise<T> {
  return typeof v === "object" && v !== null && "then" in (v as Record<string, unknown>);
}

/**
 * Synchronous factory that works with both sync and async cookies() in Next 14/15.
 * Keep this function sync; internal cookie hooks can be async.
 */
export function createClient() {
  const maybeStore = cookies(); // Next 14: CookieStore; Next 15: Promise<CookieStore>

  // Normalize to a Promise<CookieStore> without using `any`
  const storePromise: Promise<CookieStore> = isPromise<CookieStore>(maybeStore)
    ? maybeStore
    : Promise.resolve(maybeStore as CookieStore);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await storePromise;
          return store.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const store = await storePromise;
          store.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          const store = await storePromise;
          store.set({ name, value: "", ...options });
        },
      },
    }
  );
}
