import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    FolderKanban,
    Bell,
    User,
    LogOut,
} from 'lucide-react';

const navItems = [
    { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/portal/projects', label: 'Projects', icon: FolderKanban },
    { href: '/portal/notifications', label: 'Notifications', icon: Bell },
    { href: '/portal/profile', label: 'Profile', icon: User },
];

export function PortalSidebar() {
    const { url } = usePage();

    const isActive = (href: string) => url.startsWith(href);

    return (
        <>
            <aside className="hidden w-56 flex-col border-r border-[#1e1e2a] bg-[#0f0f14] md:flex">
                <div className="flex h-14 items-center gap-2 border-b border-[#1e1e2a] px-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#3b6cdb] text-[10px] font-bold text-white">
                        T
                    </div>
                    <span className="text-sm font-semibold text-[#e8e8ed]">
                        Customer Portal
                    </span>
                </div>
                <nav className="flex-1 space-y-1 p-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                    active
                                        ? 'bg-[#3b6cdb]/10 text-[#3b6cdb]'
                                        : 'text-[#8b8b9e] hover:bg-[#1a1a24] hover:text-[#e8e8ed]'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="border-t border-[#1e1e2a] p-3">
                    <Link
                        href="/portal/auth/logout"
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#8b8b9e] transition-colors hover:bg-[#1a1a24] hover:text-[#f87171]"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </aside>

            <nav className="fixed right-0 bottom-0 left-0 z-50 flex border-t border-[#1e1e2a] bg-[#0f0f14] md:hidden">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                                active ? 'text-[#3b6cdb]' : 'text-[#555570]'
                            }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
