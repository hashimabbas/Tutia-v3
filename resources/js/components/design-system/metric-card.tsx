import { cn } from '@/lib/utils';

export function MetricCard({
    value,
    label,
    className,
}: {
    value: string | number;
    label: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'flex flex-col items-center gap-1 text-center',
                className,
            )}
        >
            <span className="text-3xl font-bold text-brand-navy-500 md:text-4xl lg:text-5xl">
                {value}
            </span>
            <span className="text-sm text-neutral-500 md:text-base">
                {label}
            </span>
        </div>
    );
}
