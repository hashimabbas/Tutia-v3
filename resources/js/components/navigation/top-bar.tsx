import { Phone, Mail } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';
import { SocialLinks } from './social-links';

export function TopBar() {
    return (
        <div className="hidden border-b border-neutral-100 bg-neutral-50 px-4 py-2 text-sm text-neutral-600 md:block dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
            <div className="container-main flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <a
                        href={`tel:${COMPANY_INFO.phone[0]}`}
                        className="flex items-center gap-1.5 transition-colors hover:text-brand-navy-500"
                    >
                        <Phone className="size-3.5" />
                        <span>{COMPANY_INFO.phone[0]}</span>
                    </a>
                    <a
                        href={`mailto:${COMPANY_INFO.email}`}
                        className="flex items-center gap-1.5 transition-colors hover:text-brand-navy-500"
                    >
                        <Mail className="size-3.5" />
                        <span>{COMPANY_INFO.email}</span>
                    </a>
                </div>
                <SocialLinks />
            </div>
        </div>
    );
}
