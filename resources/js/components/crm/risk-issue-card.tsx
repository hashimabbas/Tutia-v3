import { Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import SeverityBadge from '@/components/crm/severity-badge';

interface Owner {
    id: number;
    name: string;
}

interface RiskIssueCardProps {
    id: number;
    description: string;
    severity: string;
    status: string;
    owner?: Owner | null;
    projectId: number;
    type: 'risk' | 'issue';
}

export default function RiskIssueCard({ id, description, severity, status, owner, projectId, type }: RiskIssueCardProps) {
    const baseUrl = `/crm/projects/${projectId}/${type === 'risk' ? 'risks' : 'issues'}`;

    return (
        <Link
            href={`${baseUrl}`}
            className="block rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-2.5 transition-colors hover:border-[#2a2a3a]"
        >
            <div className="flex items-start gap-2">
                <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    style={{ color: severity === 'blocker' || severity === 'critical' ? '#f87171' : severity === 'high' || severity === 'major' ? '#fbbf24' : '#555570' }}
                />
                <div className="min-w-0 flex-1">
                    <div className="mb-1 text-xs text-[#e8e8ed] leading-relaxed line-clamp-2">{description}</div>
                    <div className="flex items-center gap-1.5">
                        <SeverityBadge severity={severity} />
                        <span className="text-[9px] capitalize text-[#555570]">{status.replace(/_/g, ' ')}</span>
                        {owner && <span className="ml-auto text-[9px] text-[#555570]">{owner.name}</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
}
