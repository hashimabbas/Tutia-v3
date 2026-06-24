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
    BarChart3,
    Brain,
    TrendingUp,
    Sparkles,
    Activity,
    Play,
    GitBranch,
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
            { title: 'Workflows', href: '/crm/workflows', icon: GitBranch },
            { title: 'Workflow Runs', href: '/crm/workflows/runs', icon: Play },
            { title: 'Approvals', href: '/crm/approvals', icon: Sparkles },
        ],
    },
    {
        title: 'Analytics & Intelligence',
        items: [
            { title: 'Analytics Hub', href: '/crm/analytics', icon: BarChart3 },
            { title: 'Workflows Analytics', href: '/crm/analytics?tab=workflows', icon: Activity },
            { title: 'Approvals Analytics', href: '/crm/analytics?tab=approvals', icon: Sparkles },
            { title: 'Intelligence', href: '/crm/analytics?tab=intelligence', icon: Brain },
            { title: 'Optimization', href: '/crm/analytics?tab=optimization', icon: TrendingUp },
            { title: 'Predictions', href: '/crm/analytics?tab=predictions', icon: LineChart },
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
                            className={cn(
                                'mb-0.5 rounded-lg transition-all duration-200',
                                active
                                    ? 'bg-brand-navy-50 text-brand-navy-600 shadow-sm'
                                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                            )}
                        >
                            <Link href={item.href} prefetch>
                                <item.icon className={cn(
                                    'h-4 w-4',
                                    active && 'text-brand-navy-500',
                                )} />
                                {item.badge && active && (
                                    <span className="ml-auto rounded bg-brand-navy-500/10 px-1 py-[1px] text-[8px] font-medium text-brand-navy-600">
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
        <div className="px-3 py-0.5">
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200',
                    isActive
                        ? 'text-brand-navy-500'
                        : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/70',
                )}
            >
                <ChevronDown
                    className={cn(
                        'h-3 w-3 transition-transform duration-200',
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
                                    'group relative flex items-center gap-3 rounded-lg px-2 py-2 text-xs transition-all duration-200',
                                    active
                                        ? 'bg-brand-navy-50 font-medium text-brand-navy-700'
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                                )}
                            >
                                {active && (
                                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-navy-500" />
                                )}
                                <item.icon className={cn(
                                    'h-4 w-4 flex-shrink-0 transition-colors duration-200',
                                    active
                                        ? 'text-brand-navy-500'
                                        : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60',
                                )} />
                                <span className="truncate">{item.title}</span>
                                {item.badge && (
                                    <span className="ml-auto rounded-full bg-brand-navy-500/10 px-2 py-0.5 text-[9px] font-semibold text-brand-navy-600">
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
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border/60 shadow-sm">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="rounded-xl">
                            <Link href="/dashboard" prefetch>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy-500 text-xs font-bold text-white shadow-sm">
                                    T
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm font-semibold text-sidebar-foreground">Tutia</span>
                                    <span className="text-[10px] text-sidebar-foreground/40">Control Panel</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-3 w-auto bg-sidebar-border/50" />

            <SidebarContent className="py-2">
                {navSections.map((section) => (
                    <div key={section.title} className="mb-1">
                        <CollapsibleSection
                            section={section}
                            isCollapsed={isCollapsed}
                            currentUrl={url}
                        />
                        <SidebarSeparator className="mx-3 w-auto bg-sidebar-border/30" />
                    </div>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 pb-2 pt-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {isCollapsed ? (
                            <SidebarMenuButton
                                asChild
                                isActive={url.startsWith('/settings')}
                                tooltip={{ children: 'Settings' }}
                                className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent/60"
                            >
                                <Link href="/settings/profile" prefetch>
                                    <Settings className="h-4 w-4 text-sidebar-foreground/40" />
                                </Link>
                            </SidebarMenuButton>
                        ) : (
                            <Link
                                href="/settings/profile"
                                prefetch
                                className={cn(
                                    'group relative flex items-center gap-3 rounded-lg px-2 py-2 text-xs transition-all duration-200 mx-3',
                                    url.startsWith('/settings')
                                        ? 'bg-brand-navy-50 font-medium text-brand-navy-700'
                                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                                )}
                            >
                                {url.startsWith('/settings') && (
                                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-navy-500" />
                                )}
                                <Settings className={cn(
                                    'h-4 w-4 transition-colors duration-200',
                                    url.startsWith('/settings')
                                        ? 'text-brand-navy-500'
                                        : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60',
                                )} />
                                <span>Settings</span>
                            </Link>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
                <div className="px-3 pt-1">
                    <NavUser />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
