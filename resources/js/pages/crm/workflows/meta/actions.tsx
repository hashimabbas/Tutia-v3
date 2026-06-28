import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Zap } from 'lucide-react';

interface ActionItem {
    key: string;
    label: string;
}

interface Props {
    actions: ActionItem[];
}

export default function MetadataActions({ actions }: Props) {
    return (
        <>
            <Head title="CRM · Metadata · Actions" />

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
                            <span className="text-[#1a1a2e]">Metadata Catalog · Actions</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h2 className="text-sm font-semibold text-[#1a1a2e]">Available Actions</h2>
                        <p className="mt-1 text-xs text-[#6b7280]">
                            Actions are executed when a workflow condition is met. Multiple actions can be chained in a single workflow.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {actions.map((action) => (
                            <div
                                key={action.key}
                                className="rounded-lg border border-[#e2e6ef] bg-white p-3 transition-colors hover:border-[#c8ccd6]"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf5]">
                                        <Zap className="h-4 w-4 text-[#10b981]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium text-[#1a1a2e]">
                                            {action.label}
                                        </div>
                                        <code className="mt-0.5 block text-[10px] text-[#6b7280]">
                                            {action.key}
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
