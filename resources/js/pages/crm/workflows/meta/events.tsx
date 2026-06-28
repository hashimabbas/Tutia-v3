import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Zap, GitCompareArrows, CheckCheck } from 'lucide-react';

interface EventItem {
    key: string;
    label: string;
}

interface Props {
    events: EventItem[];
}

export default function MetadataEvents({ events }: Props) {
    return (
        <>
            <Head title="CRM · Metadata · Events" />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm/workflows"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#1a1a2e]">Metadata Catalog · Events</span>
                        </div>
                    </div>
                    <Link
                        href="/crm/workflows"
                        className="text-[11px] text-[#2B4C8C] hover:underline"
                    >
                        Back to Workflows
                    </Link>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Available Events</h2>
                        <p className="mt-1 text-xs text-[#6b7280]">
                            These events can trigger automated workflows. Each event carries contextual data available in conditions and actions.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((ev) => (
                            <div
                                key={ev.key}
                                className="rounded-lg border border-[#e2e6ef] bg-white p-3 transition-colors hover:border-[#c8ccd6]"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef2f9]">
                                        <Zap className="h-4 w-4 text-[#2B4C8C]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium text-[#1a1a2e]">
                                            {ev.label}
                                        </div>
                                        <code className="mt-0.5 block text-[10px] text-[#6b7280]">
                                            {ev.key}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                        <Link
                            href="/crm/workflows/meta/operators"
                            className="flex items-center gap-3 rounded-lg border border-[#e2e6ef] bg-white p-3 text-xs text-[#6b7280] transition-colors hover:border-[#c8ccd6] hover:text-[#1a1a2e]"
                        >
                            <GitCompareArrows className="h-4 w-4 text-[#6b7280]" />
                            Browse Operators
                        </Link>
                        <Link
                            href="/crm/workflows/meta/actions"
                            className="flex items-center gap-3 rounded-lg border border-[#e2e6ef] bg-white p-3 text-xs text-[#6b7280] transition-colors hover:border-[#c8ccd6] hover:text-[#1a1a2e]"
                        >
                            <Zap className="h-4 w-4 text-[#6b7280]" />
                            Browse Actions
                        </Link>
                        <Link
                            href="/crm/workflows/meta/approval-flows"
                            className="flex items-center gap-3 rounded-lg border border-[#e2e6ef] bg-white p-3 text-xs text-[#6b7280] transition-colors hover:border-[#c8ccd6] hover:text-[#1a1a2e]"
                        >
                            <CheckCheck className="h-4 w-4 text-[#6b7280]" />
                            Approval Flows
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
