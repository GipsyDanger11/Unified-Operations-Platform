import { ReactNode } from "react";
import WaveBackground from "./WaveBackground";

interface PublicLayoutProps {
    children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <div className="min-h-screen relative bg-slate-50">
            <WaveBackground />
            <div className="relative z-10 min-h-screen flex flex-col">
                <header className="p-6">
                    <div className="container mx-auto">
                        <h1 className="text-2xl font-bold text-purple-900">Unified Operations</h1>
                    </div>
                </header>
                <main className="flex-1 container mx-auto px-6 py-8">
                    {children}
                </main>
                <footer className="p-6 text-center text-purple-800/60 text-sm">
                    &copy; {new Date().getFullYear()} Unified Operations Platform
                </footer>
            </div>
        </div>
    );
}
