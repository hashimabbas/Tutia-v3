import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    User,
    Briefcase,
    Building2,
    Package,
    Settings,
    Target,
    BarChart3,
    Brain,
    TrendingUp,
    Sparkles,
    Activity,
    Play,
    GitBranch,
    HardHat,
    AlertTriangle,
    GitCompareArrows,
    Upload,
    Clock,
    Zap,
    Workflow,
    ShieldCheck,
    FunctionSquare,
    BookOpen,
    Bug,
    Gauge,
    Lightbulb,
    Award,
    History,
    Search,
    Plus,
    Kanban,
    ChevronDown,
    SunMoon,
    KeyRound,
    UserCircle,
    PieChart,
    ChevronRight,
    FileText,
    Camera,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
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
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { SidebarNavItem, WorkspaceNav } from '@/types';

const WORKSPACE_KEY = 'tutia:active-workspace';

// ─── Workspace Definitions ───────────────────────────────────────
// Every authenticated page in the system is listed in exactly one workspace.

const workspaces: WorkspaceNav[] = [
    {
        id: 'sales',
        label: 'Sales',
        icon: Briefcase,
        sections: [
            {
                label: 'Overview',
                items: [
                    { title: 'CRM Dashboard', href: '/crm/dashboard', icon: LayoutDashboard },
                ],
            },
            {
                label: 'People',
                items: [
                    { title: 'Leads', href: '/crm/leads', icon: Users },
                    { title: 'Contacts', href: '/crm/contacts', icon: User },
                    { title: 'Organizations', href: '/crm/organizations', icon: Building2 },
                ],
            },
            {
                label: 'Revenue',
                items: [
                    { title: 'Deals', href: '/crm/deals', icon: Briefcase },
                    { title: 'Pipeline', href: '/crm/pipeline', icon: Kanban },
                    { title: 'Forecast', href: '/crm/forecast', icon: Target },
                ],
            },
            {
                label: 'Catalog',
                items: [
                    { title: 'Products', href: '/crm/products', icon: Package },
                    { title: 'Quotations', href: '/crm/quotations', icon: FileText },
                ],
            },
            {
                label: 'Content',
                items: [
                    { title: 'Blog', href: '/crm/blog', icon: BookOpen, badge: 'NEW' },
                    { title: 'Experience Gallery', href: '/crm/experiences', icon: Camera },
                ],
            },
        ],
    },
    {
        id: 'delivery',
        label: 'Delivery',
        icon: HardHat,
        sections: [
            {
                label: 'Projects',
                items: [
                    { title: 'All Projects', href: '/crm/projects', icon: HardHat },
                ],
            },
            {
                label: 'Oversight',
                items: [
                    { title: 'Risks', href: '/crm/risks', icon: AlertTriangle },
                    { title: 'Issues', href: '/crm/issues', icon: Bug },
                    { title: 'Milestones', href: '/crm/milestones', icon: GitBranch },
                    { title: 'Deliverables', href: '/crm/deliverables', icon: Package },
                ],
            },
            {
                label: 'Changes',
                items: [
                    { title: 'Change Orders', href: '/crm/change-orders', icon: GitCompareArrows },
                    { title: 'Activities', href: '/crm/activities', icon: Activity },
                    { title: 'Timeline', href: '/crm/timeline', icon: Clock },
                    { title: 'Imports', href: '/crm/imports', icon: Upload },
                ],
            },
        ],
    },
    {
        id: 'automation',
        label: 'Automation',
        icon: Zap,
        sections: [
            {
                label: 'Workflows',
                items: [
                    { title: 'All Workflows', href: '/crm/workflows', icon: GitBranch },
                    { title: 'Workflow Builder', href: '/crm/workflows/create', icon: Workflow },
                    { title: 'Workflow Runs', href: '/crm/workflows/runs', icon: Play },
                    { title: 'Debug Console', href: '/crm/workflows', icon: Bug },
                ],
            },
            {
                label: 'Approvals',
                items: [
                    { title: 'All Approvals', href: '/crm/approvals', icon: ShieldCheck },
                ],
            },
            {
                label: 'Tools',
                items: [
                    { title: 'Expression Builder', href: '/crm/workflows/1', icon: FunctionSquare },
                    { title: 'Metadata Catalog', href: '/crm/workflows/meta/events', icon: BookOpen },
                ],
            },
        ],
    },
    {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        sections: [
            {
                label: 'Hub',
                items: [
                    { title: 'Analytics Hub', href: '/crm/analytics', icon: BarChart3 },
                ],
            },
            {
                label: 'Metrics',
                items: [
                    { title: 'Workflow Analytics', href: '/crm/analytics?tab=workflows', icon: Activity },
                    { title: 'Approval Analytics', href: '/crm/analytics?tab=approvals', icon: Sparkles },
                    { title: 'Health Scores', href: '/crm/analytics?tab=health', icon: Activity },
                ],
            },
            {
                label: 'Intelligence',
                items: [
                    { title: 'Intelligence Hub', href: '/crm/analytics?tab=intelligence', icon: Brain },
                    { title: 'Predictions', href: '/crm/analytics?tab=predictions', icon: TrendingUp },
                    { title: 'Segmentation', href: '/crm/analytics?tab=segmentation', icon: PieChart },
                ],
            },
        ],
    },
    {
        id: 'optimization',
        label: 'Optimization',
        icon: TrendingUp,
        sections: [
            {
                label: 'Center',
                items: [
                    { title: 'Optimization Center', href: '/crm/optimization/center', icon: Gauge, badge: 'NEW' },
                ],
            },
            {
                label: 'Recommendations',
                items: [
                    { title: 'Recommendations', href: '/crm/optimization/recommendations', icon: Lightbulb, badge: 'NEW' },
                    { title: 'Impact', href: '/crm/optimization/recommendations/1/impact', icon: TrendingUp },
                ],
            },
            {
                label: 'Scoring',
                items: [
                    { title: 'Automation Score', href: '/crm/optimization/automation-score', icon: Award, badge: 'NEW' },
                    { title: 'History & Trends', href: '/crm/optimization/automation-score/history', icon: History },
                ],
            },
        ],
    },
];

const quickActions = [
    { label: 'New Lead', href: '/crm/leads/create', icon: Users },
    { label: 'New Deal', href: '/crm/deals/create', icon: Briefcase },
    { label: 'New Workflow', href: '/crm/workflows/create', icon: GitBranch },
    { label: 'New Contact', href: '/crm/contacts/create', icon: User },
    { label: 'New Organization', href: '/crm/organizations/create', icon: Building2 },
    { label: 'New Product', href: '/crm/products/create', icon: Package },
    { label: 'Import Data', href: '/crm/imports', icon: Upload },
];

const settingsPages: SidebarNavItem[] = [
    { title: 'Profile', href: '/settings/profile', icon: UserCircle },
    { title: 'Security', href: '/settings/security', icon: KeyRound },
    { title: 'Appearance', href: '/settings/appearance', icon: SunMoon },
];

// ─── Helpers ─────────────────────────────────────────────────────

function matchUrl(current: string, target: string): boolean {
    if (target.includes('?')) return current === target;
    return current.startsWith(target);
}

function detectWorkspace(url: string): string | null {
    if (url.startsWith('/crm/optimization')) return 'optimization';
    if (url.startsWith('/crm/analytics')) return 'analytics';
    if (url.startsWith('/crm/workflows') || url.startsWith('/crm/approvals')) return 'automation';
    if (url.startsWith('/crm/projects') || url.startsWith('/crm/timeline') || url.startsWith('/crm/imports') || url.startsWith('/crm/activities') || url.startsWith('/crm/risks') || url.startsWith('/crm/issues') || url.startsWith('/crm/milestones') || url.startsWith('/crm/deliverables') || url.startsWith('/crm/change-orders')) return 'delivery';
    if (url.startsWith('/crm/')) return 'sales';
    return null;
}

// ─── WorkspaceSwitcher ───────────────────────────────────────────

function WorkspaceSwitcher({
    active,
    onChange,
    isCollapsed,
}: {
    active: string;
    onChange: (id: string) => void;
    isCollapsed: boolean;
}) {
    if (isCollapsed) {
        return (
            <div className="flex flex-col items-center gap-1 px-1 py-2">
                {workspaces.map((ws) => {
                    const isActive = ws.id === active;
                    return (
                        <button
                            key={ws.id}
                            type="button"
                            onClick={() => onChange(ws.id)}
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                                isActive
                                    ? 'bg-brand-navy-500 text-white shadow-sm'
                                    : 'text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                            )}
                            title={ws.label}
                        >
                            <ws.icon className="h-4 w-4" />
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0.5 px-3 py-2">
            {workspaces.map((ws) => {
                const isActive = ws.id === active;
                return (
                    <button
                        key={ws.id}
                        type="button"
                        onClick={() => onChange(ws.id)}
                        className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-all duration-200',
                            isActive
                                ? 'bg-brand-navy-50 font-medium text-brand-navy-700'
                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                        )}
                    >
                        <ws.icon className={cn(
                            'h-4 w-4 flex-shrink-0',
                            isActive ? 'text-brand-navy-500' : 'text-sidebar-foreground/40',
                        )} />
                        <span>{ws.label}</span>
                        {isActive && (
                            <span className="ml-auto rounded-full bg-brand-navy-500/10 px-1.5 py-0.5 text-[8px] font-medium text-brand-navy-600">
                                Active
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── NavItemLink ──────────────────────────────────────────────────

function NavItemLink({
    item,
    currentUrl,
    depth = 0,
}: {
    item: SidebarNavItem;
    currentUrl: string;
    depth?: number;
}) {
    const [isOpen, setOpen] = useState(true);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = matchUrl(currentUrl, item.href);
    const anyChildActive = hasChildren && item.children!.some((c) => matchUrl(currentUrl, c.href));

    return (
        <div>
            <Link
                href={item.href}
                prefetch
                className={cn(
                    'group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-all duration-200',
                    depth === 0 ? '' : 'ml-5',
                    isActive || anyChildActive
                        ? 'bg-brand-navy-50 font-medium text-brand-navy-700'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                )}
                onClick={hasChildren ? (e) => { e.preventDefault(); setOpen(!isOpen); } : undefined}
            >
                {(isActive || anyChildActive) && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-navy-500" />
                )}
                <item.icon className={cn(
                    'h-4 w-4 flex-shrink-0 transition-colors duration-200',
                    isActive || anyChildActive
                        ? 'text-brand-navy-500'
                        : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60',
                )} />
                <span className="flex-1 truncate">{item.title}</span>
                {item.badge && (
                    <span className={cn(
                        'ml-auto inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-white',
                        item.badgeColor ?? 'bg-brand-navy-500',
                    )}>
                        {item.badge}
                    </span>
                )}
                {hasChildren && (
                    <ChevronRight className={cn('h-3 w-3 transition-transform duration-200', isOpen ? 'rotate-90' : '')} />
                )}
            </Link>
            {hasChildren && isOpen && (
                <div className="mt-0.5 space-y-0.5">
                    {item.children!.map((child) => (
                        <NavItemLink key={child.title} item={child} currentUrl={currentUrl} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── CollapsedNav ─────────────────────────────────────────────────

function CollapsedNav({
    items,
    currentUrl,
}: {
    items: SidebarNavItem[];
    currentUrl: string;
}) {
    return (
        <div className="flex flex-col items-center gap-0.5 px-1">
            {items.map((item) => {
                const active = matchUrl(currentUrl, item.href);
                const anyChildActive = item.children?.some((c) => matchUrl(currentUrl, c.href));
                return (
                    <SidebarMenuButton
                        key={item.href}
                        asChild
                        isActive={active || anyChildActive}
                        tooltip={{ children: item.title }}
                        className={cn(
                            'mb-0.5 rounded-lg transition-all duration-200',
                            active || anyChildActive
                                ? 'bg-brand-navy-50 text-brand-navy-600 shadow-sm'
                                : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        )}
                    >
                        <Link href={item.href} prefetch>
                            <item.icon className={cn('h-4 w-4', (active || anyChildActive) && 'text-brand-navy-500')} />
                        </Link>
                    </SidebarMenuButton>
                );
            })}
        </div>
    );
}

// ─── QuickActionsDropdown ────────────────────────────────────────

function QuickActionsDropdown() {
    const [isOpen, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!isOpen)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-sidebar-foreground/40 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground/70"
            >
                <Plus className="h-3 w-3" />
                <span>Quick</span>
            </button>
            {isOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-44 rounded-lg border border-sidebar-border/50 bg-white p-1 shadow-lg">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            prefetch
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        >
                            <action.icon className="h-3.5 w-3.5 text-sidebar-foreground/40" />
                            {action.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── DashboardLink ────────────────────────────────────────────────

function DashboardLink({ currentUrl, isCollapsed }: { currentUrl: string; isCollapsed: boolean }) {
    const active = currentUrl === '/dashboard';

    if (isCollapsed) {
        return (
            <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={{ children: 'Dashboard' }}
                className={cn(
                    'rounded-lg transition-all duration-200',
                    active
                        ? 'bg-brand-navy-50 text-brand-navy-600 shadow-sm'
                        : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
            >
                <Link href="/dashboard" prefetch>
                    <LayoutDashboard className={cn('h-4 w-4', active && 'text-brand-navy-500')} />
                </Link>
            </SidebarMenuButton>
        );
    }

    return (
        <Link
            href="/dashboard"
            prefetch
            className={cn(
                'group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-all duration-200 mx-3',
                active
                    ? 'bg-brand-navy-50 font-medium text-brand-navy-700'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
            )}
        >
            {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-navy-500" />
            )}
            <LayoutDashboard className={cn(
                'h-4 w-4 transition-colors duration-200',
                active ? 'text-brand-navy-500' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/60',
            )} />
            <span>Dashboard</span>
        </Link>
    );
}

// ─── SidebarSearch ────────────────────────────────────────────────

function SidebarSearch({ isCollapsed }: { isCollapsed: boolean }) {
    if (isCollapsed) {
        return (
            <SidebarMenuButton
                asChild
                tooltip={{ children: 'Search (Ctrl+K)' }}
                className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent/60"
            >
                <button type="button">
                    <Search className="h-4 w-4 text-sidebar-foreground/40" />
                </button>
            </SidebarMenuButton>
        );
    }

    return (
        <button
            type="button"
            className="group relative mx-3 flex w-[calc(100%-1.5rem)] items-center gap-2.5 rounded-lg border border-sidebar-border/50 bg-sidebar-accent/30 px-2.5 py-1.5 text-xs text-sidebar-foreground/40 transition-all duration-200 hover:border-sidebar-border hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/60"
        >
            <Search className="h-3.5 w-3.5" />
            <span>Search anything...</span>
            <kbd className="ml-auto rounded border border-sidebar-border/50 bg-white px-1.5 py-0.5 text-[9px] font-medium text-sidebar-foreground/30 shadow-xs">
                ⌘K
            </kbd>
        </button>
    );
}

// ─── SettingsLink ─────────────────────────────────────────────────

function SettingsLink({ currentUrl, isCollapsed }: { currentUrl: string; isCollapsed: boolean }) {
    const inSettings = currentUrl.startsWith('/settings');

    if (isCollapsed) {
        return (
            <>
                <SidebarMenuButton
                    asChild
                    isActive={inSettings}
                    tooltip={{ children: 'Settings' }}
                    className="rounded-lg transition-all duration-200 hover:bg-sidebar-accent/60"
                >
                    <Link href="/settings/profile" prefetch>
                        <Settings className="h-4 w-4 text-sidebar-foreground/40" />
                    </Link>
                </SidebarMenuButton>
            </>
        );
    }

    return (
        <div className="px-3">
            <button
                type="button"
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200',
                    inSettings
                        ? 'text-brand-navy-500'
                        : 'text-sidebar-foreground/40 hover:text-sidebar-foreground/70',
                )}
                onClick={() => {
                    if (inSettings) {
                        const next = document.getElementById('settings-subnav');
                        if (next) next.classList.toggle('hidden');
                    }
                }}
            >
                <ChevronDown className="h-3 w-3" />
                Settings
            </button>
            <div id="settings-subnav" className={cn('mt-0.5 space-y-0.5', inSettings ? '' : 'hidden')}>
                {settingsPages.map((page) => {
                    const active = matchUrl(currentUrl, page.href);
                    return (
                        <Link
                            key={page.href}
                            href={page.href}
                            prefetch
                            className={cn(
                                'group relative flex items-center gap-2.5 rounded-lg px-2 py-2 text-xs transition-all duration-200',
                                active
                                    ? 'bg-brand-navy-50 font-medium text-brand-navy-700'
                                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                            )}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-navy-500" />
                            )}
                            <page.icon className={cn(
                                'h-4 w-4',
                                active ? 'text-brand-navy-500' : 'text-sidebar-foreground/40',
                            )} />
                            <span>{page.title}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

// ─── AppSidebar (Main) ────────────────────────────────────────────

export function AppSidebar() {
    const { url } = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const [activeWorkspace, setActiveWorkspace] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(WORKSPACE_KEY);
            const detected = detectWorkspace(url);
            return detected ?? saved ?? 'sales';
        }
        return 'sales';
    });

    useEffect(() => {
        const detected = detectWorkspace(url);
        if (detected && detected !== activeWorkspace) {
            setActiveWorkspace(detected);
        }
    }, [url]);

    useEffect(() => {
        localStorage.setItem(WORKSPACE_KEY, activeWorkspace);
    }, [activeWorkspace]);

    const handleWorkspaceChange = useCallback((id: string) => {
        setActiveWorkspace(id);
    }, []);

    const handleSearchClick = useCallback(() => {
        window.dispatchEvent(new CustomEvent('tutia:open-command-palette'));
    }, []);

    const currentWorkspace = workspaces.find((ws) => ws.id === activeWorkspace) || workspaces[0];

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
                                {!isCollapsed && (
                                    <div className="flex flex-col leading-tight">
                                        <span className="text-sm font-semibold text-sidebar-foreground">Tutia</span>
                                        <span className="text-[10px] text-sidebar-foreground/40">Control Panel</span>
                                    </div>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-3 w-auto bg-sidebar-border/50" />

            {/* Quick Actions + Search Bar */}
            {!isCollapsed && (
                <div className="flex items-center justify-between px-3 py-1.5">
                    <QuickActionsDropdown />
                    <div className="flex-1" />
                    <button
                        type="button"
                        onClick={handleSearchClick}
                        className="flex items-center gap-1 text-[10px] text-sidebar-foreground/30 transition-colors hover:text-sidebar-foreground/50"
                    >
                        <Search className="h-3 w-3" />
                        <kbd className="rounded border border-sidebar-border/30 px-1 text-[8px]">⌘K</kbd>
                    </button>
                </div>
            )}

            {/* Workspace Switcher */}
            <WorkspaceSwitcher
                active={activeWorkspace}
                onChange={handleWorkspaceChange}
                isCollapsed={isCollapsed}
            />

            <SidebarSeparator className="mx-3 w-auto bg-sidebar-border/30" />

            {/* Dashboard (always visible) */}
            <div className={isCollapsed ? 'flex justify-center py-1' : 'py-1'}>
                <DashboardLink currentUrl={url} isCollapsed={isCollapsed} />
            </div>

            <SidebarSeparator className="mx-3 w-auto bg-sidebar-border/30" />

            {/* Workspace Content */}
            <SidebarContent className="py-2">
                {currentWorkspace.sections.map((section) => (
                    <div key={section.label} className="mb-2">
                        {!isCollapsed && (
                            <div className="px-4 pb-1">
                                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/30">
                                    {section.label}
                                </p>
                            </div>
                        )}
                        {isCollapsed ? (
                            <CollapsedNav items={section.items} currentUrl={url} />
                        ) : (
                            <div className="space-y-0.5 px-2">
                                {section.items.map((item) => (
                                    <NavItemLink key={item.title} item={item} currentUrl={url} />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </SidebarContent>

            <SidebarSeparator className="mx-3 w-auto bg-sidebar-border/50" />

            <SidebarFooter className="pb-2 pt-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {isCollapsed ? (
                            <div className="flex flex-col items-center gap-0.5 px-1">
                                <SidebarSearch isCollapsed={true} />
                                <SettingsLink currentUrl={url} isCollapsed={true} />
                            </div>
                        ) : (
                            <>
                                <SidebarSearch isCollapsed={false} />
                                <div className="pt-1">
                                    <SettingsLink currentUrl={url} isCollapsed={false} />
                                </div>
                            </>
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
