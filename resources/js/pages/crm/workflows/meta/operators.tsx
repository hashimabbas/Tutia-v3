import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, GitCompareArrows } from 'lucide-react';

interface OperatorItem {
    key: string;
    label: string;
}

interface Props {
    operators: OperatorItem[];
}

export default function MetadataOperators({ operators }: Props) {
    return (
        <>
            <Head title="CRM · Metadata · Operators" />

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
                            <span className="text-[#1a1a2e]">Metadata Catalog · Operators</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Available Operators</h2>
                        <p className="mt-1 text-xs text-[#6b7280]">
                            Operators are used in workflow conditions to compare values.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {operators.map((op) => (
                            <div
                                key={op.key}
                                className="rounded-lg border border-[#e2e6ef] bg-white p-3 transition-colors hover:border-[#c8ccd6]"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f3ff]">
                                        <GitCompareArrows className="h-4 w-4 text-[#7c3aed]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium text-[#1a1a2e]">
                                            {op.label}
                                        </div>
                                        <code className="mt-0.5 block text-[10px] text-[#6b7280]">
                                            {op.key}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
