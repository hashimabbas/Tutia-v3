import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, Users } from 'lucide-react';

interface ApprovalFlowItem {
    id: number;
    name: string;
    strategy: string;
    steps_count: number;
}

interface Props {
    approvalFlows: ApprovalFlowItem[];
}

const strategyLabels: Record<string, string> = {
    unanimous: 'Unanimous',
    first_approver_wins: 'First Approver',
    majority_vote: 'Majority Vote',
};

export default function MetadataApprovalFlows({ approvalFlows }: Props) {
    return (
        <>
            <Head title="CRM · Metadata · Approval Flows" />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm/workflows/meta/events"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#1a1a2e]">Metadata Catalog · Approval Flows</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Approval Flows</h2>
                        <p className="mt-1 text-xs text-[#6b7280]">
                            Pre-configured approval flows available for workflow actions.
                        </p>
                    </div>

                    {approvalFlows.length === 0 ? (
                        <div className="flex h-48 items-center justify-center">
                            <div className="text-center">
                                <CheckCheck className="mx-auto mb-3 h-8 w-8 text-[#e2e6ef]" />
                                <p className="text-sm text-[#6b7280]">No approval flows configured</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {approvalFlows.map((flow) => (
                                <div
                                    key={flow.id}
                                    className="rounded-lg border border-[#e2e6ef] bg-white p-3 transition-colors hover:border-[#c8ccd6]"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#fffbeb]">
                                            <Users className="h-4 w-4 text-[#d97706]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-medium text-[#1a1a2e]">
                                                {flow.name}
                                            </div>
                                            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#6b7280]">
                                                <span>{strategyLabels[flow.strategy] ?? flow.strategy}</span>
                                                <span>·</span>
                                                <span>{flow.steps_count} steps</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
