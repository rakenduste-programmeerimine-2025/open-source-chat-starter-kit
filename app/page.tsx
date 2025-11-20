'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    const h = window.location.hash
    if (h && (h.includes('access_token') || h.includes('type=magiclink'))) {
      window.location.replace('/callback' + h)
    }
  }, [])
  return <main className="p-8">Welcome</main>
}
