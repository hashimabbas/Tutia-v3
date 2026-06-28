import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Globe } from 'lucide-react';
import PortalShell from '@/components/portal/portal-shell';

interface Preference {
    id?: number;
    channel: string;
    frequency: string;
    event_filters: string | null;
}

interface PreferencesProps {
    preferences: Preference[];
}

const channelIcons: Record<string, typeof Mail> = {
    email: Mail,
    whatsapp: MessageSquare,
    sms: Smartphone,
    portal: Globe,
};

const channelLabels: Record<string, string> = {
    email: 'Email',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    portal: 'In-App',
};

const frequencyOptions = ['immediate', 'daily', 'weekly', 'muted'];

export default function PortalPreferences({ preferences }: PreferencesProps) {
    const [prefs, setPrefs] = useState<Preference[]>(
        preferences.length > 0
            ? preferences
            : ['email', 'whatsapp', 'sms', 'portal'].map((channel) => ({
                  channel,
                  frequency: channel === 'sms' ? 'muted' : 'immediate',
                  event_filters: null,
              })),
    );

    const handleFrequencyChange = (channel: string, frequency: string) => {
        const updated = prefs.map((p) =>
            p.channel === channel ? { ...p, frequency } : p,
        );
        setPrefs(updated);
        router.patch(
            '/portal/preferences',
            { preferences: updated },
            { preserveState: true },
        );
    };

    return (
        <PortalShell title="Notification Preferences">
            <Head title="Preferences" />
            <div className="mx-auto max-w-lg space-y-4 p-4 pb-20 md:p-6">
                <div className="rounded-lg border border-[#1e1e2a] bg-[#0f0f14] p-4">
                    <p className="mb-4 text-[11px] text-[#8b8b9e]">
                        Choose how and when you receive updates about your
                        projects.
                    </p>
                    <div className="space-y-3">
                        {prefs.map((p) => {
                            const Icon = channelIcons[p.channel] ?? Bell;
                            return (
                                <div
                                    key={p.channel}
                                    className="flex items-center justify-between rounded-lg border border-[#1e1e2a] bg-[#0a0a0f] px-3 py-2.5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1a24]">
                                            <Icon className="h-4 w-4 text-[#8b8b9e]" />
                                        </div>
                                        <div>
                                            <span className="text-[12px] font-medium text-[#e8e8ed]">
                                                {channelLabels[p.channel]}
                                            </span>
                                            <span className="ml-2 text-[10px] text-[#555570]">
                                                {p.event_filters === 'critical'
                                                    ? 'Critical only'
                                                    : (p.event_filters ??
                                                      'All events')}
                                            </span>
                                        </div>
                                    </div>
                                    <select
                                        value={p.frequency}
                                        onChange={(e) =>
                                            handleFrequencyChange(
                                                p.channel,
                                                e.target.value,
                                            )
                                        }
                                        className="rounded border border-[#1e1e2a] bg-[#0a0a0f] px-2 py-1 text-[11px] text-[#e8e8ed] focus:border-[#3b6cdb] focus:outline-none"
                                    >
                                        {frequencyOptions.map((f) => (
                                            <option
                                                key={f}
                                                value={f}
                                                className="bg-[#0a0a0f] text-[#e8e8ed]"
                                            >
                                                {f.charAt(0).toUpperCase() +
                                                    f.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PortalShell>
    );
}
