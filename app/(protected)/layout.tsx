import type { ReactNode } from 'react'

export default function ProtectedLayout({
    children,
}: {
    children: ReactNode
}) {
    // На время разработки не делаем тут никаких проверок
    return <>{children}</>
}
