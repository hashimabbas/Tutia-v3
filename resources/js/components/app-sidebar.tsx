import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    User,
    Briefcase,
    Building2,
    Package,
    LineChart,
    GitFork,
    Settings,
    ChevronDown,
    Target,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavSectionItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

interface NavSection {
    title: string;
    items: NavSectionItem[];
}

const navSections: NavSection[] = [
    {
        title: 'Platform',
        items: [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'CRM',
        items: [
            { title: 'Leads', href: '/crm/leads', icon: Users },
            { title: 'Contacts', href: '/crm/contacts', icon: User },
            { title: 'Organizations', href: '/crm/organizations', icon: Building2 },
            { title: 'Deals', href: '/crm/deals', icon: Briefcase },
            { title: 'Products', href: '/crm/products', icon: Package, badge: 'NEW' },
            { title: 'Forecast', href: '/crm/forecast', icon: Target, badge: 'NEW' },
            { title: 'Pipeline', href: '/crm/pipeline', icon: GitFork, badge: 'NEW' },
        ],
    },
];

interface CollapsibleSectionProps {
    section: NavSection;
    isCollapsed: boolean;
    currentUrl: string;
}

function CollapsibleSection({ section, isCollapsed, currentUrl }: CollapsibleSectionProps) {
    const [open, setOpen] = useState(true);

    const isActive = section.items.some((item) => currentUrl.startsWith(item.href));

    if (isCollapsed) {
        return (
            <div className="px-2">
                {section.items.map((item) => {
                    const active = currentUrl.startsWith(item.href);
                    return (
                        <SidebarMenuButton
                            key={item.href}
                            asChild
                            isActive={active}
                            tooltip={{ children: item.title }}
                            className="mb-0.5"
                        >
                            <Link href={item.href} prefetch>
                                <item.icon className="h-4 w-4" />
                                {item.badge && active && (
                                    <span className="ml-auto rounded bg-[#3b6cdb]/20 px-1 py-[1px] text-[8px] font-medium text-[#3b6cdb]">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="px-3 py-1">
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors',
                    isActive
                        ? 'text-[#e8e8ed]'
                        : 'text-[#555570] hover:text-[#8b8b9e]',
                )}
            >
                <ChevronDown
                    className={cn(
                        'h-3 w-3 transition-transform',
                        open ? 'rotate-0' : '-rotate-90',
                    )}
                />
                {section.title}
            </button>
            {open && (
                <div className="mt-0.5 space-y-0.5">
                    {section.items.map((item) => {
                        const active = currentUrl.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors',
                                    active
                                        ? 'bg-[#1e1e2a] text-[#e8e8ed] font-medium'
                                        : 'text-[#555570] hover:bg-[#1a1a24] hover:text-[#8b8b9e]',
                                )}
                            >
                                <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{item.title}</span>
                                {item.badge && (
                                    <span className="ml-auto rounded bg-[#3b6cdb]/15 px-1.5 py-[2px] text-[8px] font-medium text-[#3b6cdb]">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function AppSidebar() {
    const { url } = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                {navSections.map((section) => (
                    <div key={section.title}>
                        <CollapsibleSection
                            section={section}
                            isCollapsed={isCollapsed}
                            currentUrl={url}
                        />
                        <SidebarSeparator className="my-1" />
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {isCollapsed ? (
                            <SidebarMenuButton
                                asChild
                                isActive={url.startsWith('/settings')}
                                tooltip={{ children: 'Settings' }}
                            >
                                <Link href="/settings/profile" prefetch>
                                    <Settings className="h-4 w-4" />
                                </Link>
                            </SidebarMenuButton>
                        ) : (
                            <Link
                                href="/settings/profile"
                                prefetch
                                className={cn(
                                    'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors mx-3',
                                    url.startsWith('/settings')
                                        ? 'bg-[#1e1e2a] text-[#e8e8ed] font-medium'
                                        : 'text-[#555570] hover:bg-[#1a1a24] hover:text-[#8b8b9e]',
                                )}
                            >
                                <Settings className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>Settings</span>
                            </Link>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
