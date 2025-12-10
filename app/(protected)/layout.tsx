import type { ReactNode } from "react";
import TopNav from "@/components/top-nav";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <TopNav />
            <div className="min-h-screen bg-background">{children}</div>
        </>
    );
}
