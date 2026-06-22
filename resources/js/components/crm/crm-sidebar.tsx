import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    User,
    Briefcase,
    Building2,
    Package,
    Target,
    GitFork,
    FolderKanban,
    Settings,
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: string;
}

const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/crm/dashboard' },
    { label: 'Projects', icon: FolderKanban, href: '/crm/projects', badge: 'NEW' },
    { label: 'Leads', icon: Users, href: '/crm/leads' },
    { label: 'Contacts', icon: User, href: '/crm/contacts' },
    { label: 'Organizations', icon: Building2, href: '/crm/organizations' },
    { label: 'Deals', icon: Briefcase, href: '/crm/deals' },
    { label: 'Products', icon: Package, href: '/crm/products', badge: 'NEW' },
    { label: 'Forecast', icon: Target, href: '/crm/forecast', badge: 'NEW' },
    { label: 'Pipeline', icon: GitFork, href: '/crm/pipeline', badge: 'NEW' },
];

const bottomItems: NavItem[] = [
    { label: 'Settings', icon: Settings, href: '/settings/profile' },
];

export function CrmSidebar() {
    const { url } = usePage();
    const active = url;

    return (
        <aside className="flex h-full w-14 flex-col items-center border-r border-[#1e1e2a] bg-[#0a0a0f] py-3">
            <Link
                href="/crm/dashboard"
                className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-[#2B4C8C] text-xs font-bold text-white"
            >
                T
            </Link>

            <nav className="flex flex-1 flex-col items-center gap-1">
                {navItems.map((item) => {
                    const isActive = active.startsWith(item.href);

                    return (
                        <Tooltip key={item.href}>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-[#1e1e2a] text-white'
                                            : 'text-[#555570] hover:bg-[#1a1a24] hover:text-[#e8e8ed]'
                                    }`}
                                >
                                    <item.icon className="h-[18px] w-[18px]" />
                                    {item.badge && (
                                        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#3b6cdb]">
                                            <span className="text-[6px] font-bold text-white leading-none">+</span>
                                        </span>
                                    )}
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]">
                                {item.label}
                                {item.badge && <span className="ml-1.5 rounded bg-[#3b6cdb]/20 px-1 text-[9px] text-[#3b6cdb]">{item.badge}</span>}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </nav>

            <div className="flex flex-col items-center gap-1">
                {bottomItems.map((item) => (
                    <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                            <Link
                                href={item.href}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]"
                            >
                                <item.icon className="h-[18px] w-[18px]" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="border-[#1e1e2a] bg-[#0f0f14] text-xs text-[#e8e8ed]">
                            {item.label}
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </aside>
    );
}
