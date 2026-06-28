import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { SERVICE_CATEGORIES } from '@/lib/navigation-data';
import { cn } from '@/lib/utils';

export function MegaMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useI18n();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                className={cn(
                    'inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors',
                    isOpen
                        ? 'text-brand-navy-500'
                        : 'text-neutral-700 hover:text-brand-navy-500 dark:text-neutral-200 dark:hover:text-brand-navy-300',
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {t('nav.services')}
                <ChevronDown
                    className={cn(
                        'size-3.5 transition-transform',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {isOpen && (
                <div
                    className="absolute top-full left-1/2 z-50 mt-1 w-screen max-w-3xl -translate-x-1/2"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                            {SERVICE_CATEGORIES.map((category) => (
                                <div key={category.title}>
                                    <h3 className="mb-3 text-xs font-semibold tracking-widest text-brand-navy-500 uppercase dark:text-brand-navy-300">
                                        {t(category.title)}
                                    </h3>
                                    <ul className="space-y-2">
                                        {category.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                    onClick={() =>
                                                        setIsOpen(false)
                                                    }
                                                >
                                                    {item.icon && (
                                                        <item.icon className="mt-0.5 size-4 shrink-0 text-brand-navy-400" />
                                                    )}
                                                    <div>
                                                        <span className="block text-sm font-medium text-neutral-900 group-hover:text-brand-navy-500 dark:text-neutral-100">
                                                            {t(item.title)}
                                                        </span>
                                                        <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                                                            {item.description}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
