import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Search, Bell, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CrmTopBar() {
    const { auth } = usePage().props as { auth: { user: { name: string; email: string } } };

    return (
        <header className="flex h-11 items-center justify-between border-b border-[#1e1e2a] bg-[#0a0a0f] px-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-[#555570]">
                    <Search className="h-3.5 w-3.5" />
                    <span>Search...</span>
                    <kbd className="rounded border border-[#1e1e2a] bg-[#0f0f14] px-1.5 py-0.5 text-[10px] text-[#555570]">
                        ⌘K
                    </kbd>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                    <Bell className="h-4 w-4" />
                </button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex h-7 w-7 items-center justify-center rounded-md text-[#555570] transition-colors hover:bg-[#1a1a24] hover:text-[#e8e8ed]">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2B4C8C] text-[10px] font-medium text-white">
                                {auth?.user?.name?.charAt(0) ?? 'U'}
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-48 border-[#1e1e2a] bg-[#0f0f14] text-[#e8e8ed]"
                    >
                        <DropdownMenuLabel className="text-xs text-[#555570]">
                            {auth?.user?.email ?? ''}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#1e1e2a]" />
                        <DropdownMenuItem asChild className="cursor-pointer text-xs text-[#e8e8ed] focus:bg-[#1a1a24] focus:text-white">
                            <Link href="/settings/profile">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#1e1e2a]" />
                        <DropdownMenuItem asChild className="cursor-pointer text-xs text-[#ef4444] focus:bg-[#1a1a24]">
                            <Link href="/logout" method="post" as="button">
                                <LogOut className="mr-2 h-3.5 w-3.5" />
                                Sign out
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
