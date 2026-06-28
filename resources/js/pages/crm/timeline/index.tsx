import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock } from 'lucide-react';

export default function TimelineIndex() {
    return (
        <>
            <Head title="CRM · Timeline" />

            <div className="flex h-full flex-col">
                <div className="z-10 flex items-center justify-between border-b border-[#e2e6ef] bg-white/90 px-6 py-2.5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/crm"
                            className="flex h-7 w-7 items-center justify-center rounded text-[#6b7280] transition-colors hover:bg-[#f8f9fc] hover:text-[#1a1a2e]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#1a1a2e]">Timeline</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <Clock className="mx-auto mb-3 h-10 w-10 text-[#e2e6ef]" />
                        <h2 className="mb-1 text-sm font-medium text-[#1a1a2e]">
                            Global Timeline
                        </h2>
                        <p className="mb-4 text-xs text-[#6b7280]">
                            View activity across all projects and entities.
                        </p>
                        <Link
                            href="/crm/activities"
                            className="inline-flex items-center gap-1.5 rounded-md bg-[#2B4C8C] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#3b5d9c]"
                        >
                            View All Activities
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
