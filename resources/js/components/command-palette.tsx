import { useEffect, useState, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import {
    Search,
    Command,
    ArrowRight,
    LayoutDashboard,
    Users,
    User,
    Briefcase,
    Building2,
    Package,
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
    PieChart,
    Settings,
    Kanban,
    FileText,
    KeyRound,
    SunMoon,
    UserCircle,
} from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

interface CommandItem {
    id: string;
    title: string;
    href: string;
    icon: React.ElementType;
    workspace: string;
    keywords: string[];
}

const commandIndex: CommandItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        workspace: 'all',
        keywords: ['home', 'main'],
    },
    {
        id: 'crm-dashboard',
        title: 'CRM Dashboard',
        href: '/crm/dashboard',
        icon: LayoutDashboard,
        workspace: 'sales',
        keywords: ['crm', 'home', 'sales'],
    },
    {
        id: 'leads',
        title: 'Leads',
        href: '/crm/leads',
        icon: Users,
        workspace: 'sales',
        keywords: ['lead', 'customer', 'prospect'],
    },
    {
        id: 'leads-create',
        title: 'New Lead',
        href: '/crm/leads/create',
        icon: Users,
        workspace: 'sales',
        keywords: ['create', 'add', 'new lead'],
    },
    {
        id: 'contacts',
        title: 'Contacts',
        href: '/crm/contacts',
        icon: User,
        workspace: 'sales',
        keywords: ['person', 'people'],
    },
    {
        id: 'contacts-create',
        title: 'New Contact',
        href: '/crm/contacts/create',
        icon: User,
        workspace: 'sales',
        keywords: ['create', 'add'],
    },
    {
        id: 'organizations',
        title: 'Organizations',
        href: '/crm/organizations',
        icon: Building2,
        workspace: 'sales',
        keywords: ['org', 'company', 'account'],
    },
    {
        id: 'deals',
        title: 'Deals',
        href: '/crm/deals',
        icon: Briefcase,
        workspace: 'sales',
        keywords: ['opportunity', 'sales', 'pipeline'],
    },
    {
        id: 'deals-create',
        title: 'New Deal',
        href: '/crm/deals/create',
        icon: Briefcase,
        workspace: 'sales',
        keywords: ['create', 'add opportunity'],
    },
    {
        id: 'pipeline',
        title: 'Pipeline',
        href: '/crm/pipeline',
        icon: Kanban,
        workspace: 'sales',
        keywords: ['kanban', 'board', 'stages'],
    },
    {
        id: 'forecast',
        title: 'Forecast',
        href: '/crm/forecast',
        icon: Target,
        workspace: 'sales',
        keywords: ['revenue', 'prediction', 'quarterly'],
    },
    {
        id: 'products',
        title: 'Products',
        href: '/crm/products',
        icon: Package,
        workspace: 'sales',
        keywords: ['catalog', 'item', 'service'],
    },
    {
        id: 'quotations',
        title: 'Quotations',
        href: '/crm/deals/1/quotations',
        icon: FileText,
        workspace: 'sales',
        keywords: ['quote', 'proposal', 'estimate'],
    },
    {
        id: 'projects',
        title: 'All Projects',
        href: '/crm/projects',
        icon: HardHat,
        workspace: 'delivery',
        keywords: ['delivery', 'portfolio'],
    },
    {
        id: 'risks',
        title: 'Risks',
        href: '/crm/projects/1/risks',
        icon: AlertTriangle,
        workspace: 'delivery',
        keywords: ['risk', 'mitigation'],
    },
    {
        id: 'issues',
        title: 'Issues',
        href: '/crm/projects/1/issues',
        icon: Bug,
        workspace: 'delivery',
        keywords: ['problem', 'blocker'],
    },
    {
        id: 'milestones',
        title: 'Milestones',
        href: '/crm/projects/1/milestones',
        icon: GitBranch,
        workspace: 'delivery',
        keywords: ['phase', 'gate'],
    },
    {
        id: 'change-orders',
        title: 'Change Orders',
        href: '/crm/projects/1/change-orders',
        icon: GitCompareArrows,
        workspace: 'delivery',
        keywords: ['change', 'variation', 'modification'],
    },
    {
        id: 'activities',
        title: 'Activities',
        href: '/crm/activities',
        icon: Activity,
        workspace: 'delivery',
        keywords: ['log', 'task', 'history'],
    },
    {
        id: 'timeline',
        title: 'Timeline',
        href: '/crm/timeline',
        icon: Clock,
        workspace: 'delivery',
        keywords: ['feed', 'activity log'],
    },
    {
        id: 'imports',
        title: 'Imports',
        href: '/crm/imports',
        icon: Upload,
        workspace: 'delivery',
        keywords: ['csv', 'upload', 'data'],
    },
    {
        id: 'workflows',
        title: 'All Workflows',
        href: '/crm/workflows',
        icon: GitBranch,
        workspace: 'automation',
        keywords: ['automation', 'rule'],
    },
    {
        id: 'workflow-create',
        title: 'New Workflow',
        href: '/crm/workflows/create',
        icon: Workflow,
        workspace: 'automation',
        keywords: ['create', 'builder'],
    },
    {
        id: 'workflow-runs',
        title: 'Workflow Runs',
        href: '/crm/workflows/runs',
        icon: Play,
        workspace: 'automation',
        keywords: ['execution', 'log', 'history'],
    },
    {
        id: 'approvals',
        title: 'Approvals',
        href: '/crm/approvals',
        icon: ShieldCheck,
        workspace: 'automation',
        keywords: ['approve', 'reject', 'review'],
    },
    {
        id: 'expression-builder',
        title: 'Expression Builder',
        href: '/crm/workflows/1',
        icon: FunctionSquare,
        workspace: 'automation',
        keywords: ['formula', 'condition', 'rule'],
    },
    {
        id: 'metadata',
        title: 'Metadata Catalog',
        href: '/crm/workflows/meta/events',
        icon: BookOpen,
        workspace: 'automation',
        keywords: ['events', 'actions', 'operators'],
    },
    {
        id: 'debug',
        title: 'Debug Console',
        href: '/crm/workflows/runs/1',
        icon: Bug,
        workspace: 'automation',
        keywords: ['test', 'troubleshoot'],
    },
    {
        id: 'analytics',
        title: 'Analytics Hub',
        href: '/crm/analytics',
        icon: BarChart3,
        workspace: 'analytics',
        keywords: ['metrics', 'dashboard'],
    },
    {
        id: 'workflow-analytics',
        title: 'Workflow Analytics',
        href: '/crm/analytics?tab=workflows',
        icon: Activity,
        workspace: 'analytics',
        keywords: ['workflow metrics'],
    },
    {
        id: 'approval-analytics',
        title: 'Approval Analytics',
        href: '/crm/analytics?tab=approvals',
        icon: Sparkles,
        workspace: 'analytics',
        keywords: ['approval metrics'],
    },
    {
        id: 'intelligence',
        title: 'Intelligence Hub',
        href: '/crm/analytics?tab=intelligence',
        icon: Brain,
        workspace: 'analytics',
        keywords: ['ai', 'insights'],
    },
    {
        id: 'predictions',
        title: 'Predictions',
        href: '/crm/analytics?tab=predictions',
        icon: TrendingUp,
        workspace: 'analytics',
        keywords: ['forecast', 'sla', 'risk'],
    },
    {
        id: 'segmentation',
        title: 'Segmentation',
        href: '/crm/analytics?tab=segmentation',
        icon: PieChart,
        workspace: 'analytics',
        keywords: ['cohort', 'filter', 'segment'],
    },
    {
        id: 'optimization-center',
        title: 'Optimization Center',
        href: '/crm/optimization/center',
        icon: Gauge,
        workspace: 'optimization',
        keywords: ['overview', 'dashboard'],
    },
    {
        id: 'recommendations',
        title: 'Recommendations',
        href: '/crm/optimization/recommendations',
        icon: Lightbulb,
        workspace: 'optimization',
        keywords: ['suggestions', 'improvements'],
    },
    {
        id: 'automation-score',
        title: 'Automation Score',
        href: '/crm/optimization/automation-score',
        icon: Award,
        workspace: 'optimization',
        keywords: ['rating', 'maturity'],
    },
    {
        id: 'score-history',
        title: 'History & Trends',
        href: '/crm/optimization/automation-score/history',
        icon: History,
        workspace: 'optimization',
        keywords: ['timeline', 'changes'],
    },
    {
        id: 'impact',
        title: 'Impact',
        href: '/crm/optimization/recommendations/1/impact',
        icon: TrendingUp,
        workspace: 'optimization',
        keywords: ['before after', 'measurement'],
    },
    {
        id: 'settings-profile',
        title: 'Settings — Profile',
        href: '/settings/profile',
        icon: UserCircle,
        workspace: 'all',
        keywords: ['account', 'name', 'email'],
    },
    {
        id: 'settings-security',
        title: 'Settings — Security',
        href: '/settings/security',
        icon: KeyRound,
        workspace: 'all',
        keywords: ['password', '2fa', 'passkey'],
    },
    {
        id: 'settings-appearance',
        title: 'Settings — Appearance',
        href: '/settings/appearance',
        icon: SunMoon,
        workspace: 'all',
        keywords: ['theme', 'dark', 'light'],
    },
];

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filtered =
        query.trim() === ''
            ? commandIndex.slice(0, 10)
            : commandIndex
                  .filter((item) => {
                      const q = query.toLowerCase();
                      return (
                          item.title.toLowerCase().includes(q) ||
                          item.keywords.some((k) => k.includes(q)) ||
                          item.workspace.includes(q)
                      );
                  })
                  .slice(0, 20);

    const handleOpen = useCallback(() => {
        setOpen(true);
        setQuery('');
        setSelectedIndex(0);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setQuery('');
    }, []);

    useEffect(() => {
        const handler = () => handleOpen();
        window.addEventListener('tutia:open-command-palette', handler);

        const keyHandler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (open) {
                    handleClose();
                } else {
                    handleOpen();
                }
            }
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', keyHandler);

        return () => {
            window.removeEventListener('tutia:open-command-palette', handler);
            window.removeEventListener('keydown', keyHandler);
        };
    }, [open, handleOpen, handleClose]);

    const navigate = useCallback(
        (href: string) => {
            handleClose();
            router.visit(href);
        },
        [handleClose],
    );

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && filtered[selectedIndex]) {
            e.preventDefault();
            navigate(filtered[selectedIndex].href);
        }
    };

    return (
        <DialogPrimitive.Root
            open={open}
            onOpenChange={(o) => {
                if (!o) handleClose();
                else handleOpen();
            }}
        >
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    className="fixed top-1/4 left-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/4 rounded-xl border border-sidebar-border/60 bg-white shadow-2xl data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex items-center gap-2 border-b border-sidebar-border/40 px-4 py-3">
                        <Search className="h-4 w-4 text-sidebar-foreground/40" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search pages, features, settings..."
                            className="flex-1 border-none bg-transparent text-sm text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/30"
                        />
                        <kbd className="rounded border border-sidebar-border/30 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/40">
                            ESC
                        </kbd>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-2">
                        {filtered.length === 0 && (
                            <div className="py-8 text-center text-xs text-sidebar-foreground/40">
                                No results for &ldquo;{query}&rdquo;
                            </div>
                        )}
                        {filtered.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigate(item.href)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors',
                                    index === selectedIndex
                                        ? 'bg-brand-navy-50 text-brand-navy-700'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60',
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-4 w-4 flex-shrink-0',
                                        index === selectedIndex
                                            ? 'text-brand-navy-500'
                                            : 'text-sidebar-foreground/40',
                                    )}
                                />
                                <span className="flex-1">{item.title}</span>
                                {item.workspace !== 'all' && (
                                    <span className="rounded bg-sidebar-accent/50 px-1.5 py-0.5 text-[8px] font-medium tracking-wider text-sidebar-foreground/40 uppercase">
                                        {item.workspace}
                                    </span>
                                )}
                                {index === selectedIndex && (
                                    <ArrowRight className="h-3 w-3 text-brand-navy-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 border-t border-sidebar-border/40 px-4 py-2 text-[10px] text-sidebar-foreground/30">
                        <span>↑↓ Navigate</span>
                        <span>↵ Open</span>
                        <span className="ml-auto">⌘K / ESC Toggle</span>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
