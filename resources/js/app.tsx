import { createInertiaApp } from '@inertiajs/react';
import { I18nProvider } from '@/components/i18n-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import CrmLayout from '@/components/crm/crm-layout';
import MainLayout from '@/layouts/main-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('crm/'):
                return CrmLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name === 'dashboard':
                return AppLayout;
            default:
                return MainLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <I18nProvider>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </I18nProvider>
        );
    },
    progress: {
        color: '#2B4C8C',
    },
});

initializeTheme();
