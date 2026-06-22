import { Facebook, Twitter, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

const socialIcons = [
    { href: COMPANY_INFO.social.facebook, icon: Facebook, label: 'Facebook' },
    { href: COMPANY_INFO.social.twitter, icon: Twitter, label: 'Twitter' },
    { href: COMPANY_INFO.social.instagram, icon: Instagram, label: 'Instagram' },
    { href: COMPANY_INFO.social.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { href: COMPANY_INFO.social.whatsapp, icon: MessageCircle, label: 'WhatsApp' },
];

export function SocialLinks({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {socialIcons.map((social) => (
                <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 transition-colors hover:text-brand-navy-500 dark:text-neutral-400 dark:hover:text-brand-navy-300"
                    aria-label={social.label}
                >
                    <social.icon className="size-3.5" />
                </a>
            ))}
        </div>
    );
}
