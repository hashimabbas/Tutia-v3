import { Head } from '@inertiajs/react';
import { useState } from 'react';

export default function PortalLogin() {
    const [token, setToken] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (token.trim()) {
            window.location.href = `/portal/auth/token/${token.trim()}`;
        }
    };

    return (
        <>
            <Head title="Customer Portal — Sign In" />
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-4">
                <div className="w-full max-w-sm rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-6">
                    <div className="mb-6 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[#3b6cdb] text-sm font-bold text-white">T</div>
                        <h1 className="text-base font-semibold text-[#e8e8ed]">Customer Portal</h1>
                        <p className="mt-1 text-[11px] text-[#8b8b9e]">Enter your access link to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-[11px] font-medium text-[#8b8b9e]">Access Token</label>
                            <input
                                type="text"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                placeholder="Paste your access link token here"
                                className="w-full rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2 text-sm text-[#e8e8ed] placeholder:text-[#555570] focus:border-[#3b6cdb] focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-[#3b6cdb] py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d56b0]"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="mt-4 text-center text-[10px] text-[#555570]">
                        Don't have an access link? Contact your project manager.
                    </p>
                </div>
            </div>
        </>
    );
}
