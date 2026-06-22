import { Head } from '@inertiajs/react';
import { User, Mail, Globe, LogIn, Calendar } from 'lucide-react';
import PortalShell from '@/components/portal/portal-shell';

interface AccountData {
    email: string;
    name: string;
    locale: string;
    login_count: number;
    last_login_at: string | null;
    enabled_at: string | null;
}

interface ProfileProps {
    account: AccountData;
}

export default function PortalProfile({ account }: ProfileProps) {
    return (
        <PortalShell title="Profile">
            <Head title="Profile" />
            <div className="mx-auto max-w-lg space-y-4 p-4 pb-20 md:p-6">
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-6">
                    <div className="mb-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#3b6cdb]/10">
                            <User className="h-6 w-6 text-[#3b6cdb]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-[#e8e8ed]">{account.name}</h2>
                            <p className="text-[11px] text-[#8b8b9e]">{account.email}</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[12px]">
                            <Mail className="h-4 w-4 text-[#555570]" />
                            <span className="text-[#8b8b9e]">Email</span>
                            <span className="ml-auto text-[#e8e8ed]">{account.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px]">
                            <Globe className="h-4 w-4 text-[#555570]" />
                            <span className="text-[#8b8b9e]">Language</span>
                            <span className="ml-auto text-[#e8e8ed]">{account.locale === 'ar' ? 'العربية' : 'English'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px]">
                            <LogIn className="h-4 w-4 text-[#555570]" />
                            <span className="text-[#8b8b9e]">Logins</span>
                            <span className="ml-auto text-[#e8e8ed]">{account.login_count}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px]">
                            <Calendar className="h-4 w-4 text-[#555570]" />
                            <span className="text-[#8b8b9e]">Last Login</span>
                            <span className="ml-auto text-[#e8e8ed]">
                                {account.last_login_at
                                    ? new Date(account.last_login_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px]">
                            <Calendar className="h-4 w-4 text-[#555570]" />
                            <span className="text-[#8b8b9e]">Portal Since</span>
                            <span className="ml-auto text-[#e8e8ed]">
                                {account.enabled_at
                                    ? new Date(account.enabled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </PortalShell>
    );
}
