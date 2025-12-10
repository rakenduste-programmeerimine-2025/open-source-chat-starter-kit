"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
    const pathname = usePathname();
    const links = [
        { href: "/servers", label: "Servers" },
        { href: "/me", label: "Me" },
    ];

    return (
        <nav className="border-b bg-white">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
                <span className="font-semibold">Chat Starter</span>
                <div className="flex items-center gap-3 text-sm">
                    {links.map((l) => {
                        const active = pathname === l.href || pathname?.startsWith(l.href + "/");
                        return (
                            <Link
                                key={l.href}
                                href={l.href}
                                className={`rounded px-2 py-1 hover:bg-muted ${active ? "underline underline-offset-4" : ""
                                    }`}
                            >
                                {l.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
