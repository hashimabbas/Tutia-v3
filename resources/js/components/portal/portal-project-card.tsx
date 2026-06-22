import { Link } from '@inertiajs/react';
import { PortalHealthBadge } from '@/components/portal/portal-health-badge';

interface ProjectCardProps {
    id: number;
    name: string;
    status: string;
    health_tier?: string;
    total_value?: number;
    milestones?: Array<{ status: string }>;
}

export function PortalProjectCard({ id, name, status, health_tier, total_value, milestones }: ProjectCardProps) {
    const completedCount = milestones?.filter(m => m.status === 'completed').length ?? 0;
    const totalCount = milestones?.length ?? 0;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <Link
            href={`/portal/projects/${id}`}
            className="block rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4 transition-colors hover:border-[#2a2a3a]"
        >
            <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-[#e8e8ed]">{name}</h3>
                    <span className="mt-0.5 inline-block rounded-full bg-[#1a1a24] px-2 py-0.5 text-[10px] text-[#8b8b9e]">{status}</span>
                </div>
                {health_tier && <PortalHealthBadge tier={health_tier} />}
            </div>
            <div className="space-y-2">
                {totalCount > 0 && (
                    <div>
                        <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="text-[#8b8b9e]">Progress</span>
                            <span className="text-[#e8e8ed]">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a24]">
                            <div
                                className="h-full rounded-full bg-[#3b6cdb] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
                {total_value !== undefined && total_value > 0 && (
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8b8b9e]">Value</span>
                        <span className="text-[#e8e8ed]">${total_value.toLocaleString()}</span>
                    </div>
                )}
            </div>
        </Link>
    );
}
