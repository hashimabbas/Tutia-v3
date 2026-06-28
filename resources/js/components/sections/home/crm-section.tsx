import { useForm } from '@inertiajs/react';
import { Clock, Phone, Mail } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { COMPANY_INFO } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

const serviceOptions = [
    'E-Commerce',
    'ERP',
    'Web Development',
    'Connectivity',
    'VPN',
    'Other',
];

export function CrmSection() {
    const { t, locale } = useI18n();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/contact/submit');
    }

    return (
        <Section background="muted">
            <Container>
                <div className="grid gap-12 md:grid-cols-2">
                    <div>
                        <Heading level="h2" className="mb-4">
                            {t('home.crm.title')}
                        </Heading>
                        <Text variant="body-lg" muted className="mb-8">
                            {t('home.crm.subtitle')}
                        </Text>

                        <div className="mb-6 flex items-center gap-3 text-sm text-neutral-600">
                            <Clock className="size-4 text-brand-gold-500" />
                            <span>{t('home.crm.responseTime')}</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-neutral-600">
                                <Phone className="size-4 text-brand-gold-500" />
                                <span dir="ltr">{COMPANY_INFO.phone[0]}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-600">
                                <Mail className="size-4 text-brand-gold-500" />
                                <span>{COMPANY_INFO.email}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    {t('contact.name') || 'Name'}
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder={
                                        locale === 'ar' ? 'اسمك' : 'Your Name'
                                    }
                                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500"
                                />
                                {errors.name && (
                                    <Text
                                        variant="caption"
                                        className="mt-1 text-red-500"
                                    >
                                        {errors.name}
                                    </Text>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    {t('contact.email') || 'Email'}
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    placeholder={
                                        locale === 'ar'
                                            ? 'بريدك الإلكتروني'
                                            : 'Your Email'
                                    }
                                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500"
                                />
                                {errors.email && (
                                    <Text
                                        variant="caption"
                                        className="mt-1 text-red-500"
                                    >
                                        {errors.email}
                                    </Text>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    {t('contact.phone') || 'Phone'}
                                </label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    placeholder={
                                        locale === 'ar' ? 'هاتفك' : 'Your Phone'
                                    }
                                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500"
                                />
                                {errors.phone && (
                                    <Text
                                        variant="caption"
                                        className="mt-1 text-red-500"
                                    >
                                        {errors.phone}
                                    </Text>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    {t('contact.service') || 'Service Interest'}
                                </label>
                                <select
                                    value={data.service}
                                    onChange={(e) =>
                                        setData('service', e.target.value)
                                    }
                                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500"
                                >
                                    <option value="">
                                        {locale === 'ar'
                                            ? 'اختر خدمة'
                                            : 'Select a service'}
                                    </option>
                                    {serviceOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {errors.service && (
                                    <Text
                                        variant="caption"
                                        className="mt-1 text-red-500"
                                    >
                                        {errors.service}
                                    </Text>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                                    {t('contact.message') || 'Message'}
                                </label>
                                <textarea
                                    rows={4}
                                    value={data.message}
                                    onChange={(e) =>
                                        setData('message', e.target.value)
                                    }
                                    placeholder={
                                        locale === 'ar'
                                            ? 'حدثنا عن مشروعك...'
                                            : 'Tell us about your project...'
                                    }
                                    className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold-500 focus:ring-1 focus:ring-brand-gold-500"
                                />
                                {errors.message && (
                                    <Text
                                        variant="caption"
                                        className="mt-1 text-red-500"
                                    >
                                        {errors.message}
                                    </Text>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-brand-gold-500 text-white hover:bg-brand-gold-600"
                            >
                                {t('contact.sendMessage')}
                            </Button>
                        </form>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
