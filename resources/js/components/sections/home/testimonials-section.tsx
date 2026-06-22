import { Quote, Star } from 'lucide-react';
import { Section, Container, Heading, Text } from '@/components/design-system';
import { useI18n } from '@/lib/i18n';

const testimonials = [
    {
        quote: 'We have worked with TUTIA for a long time and we rely on their efficiency and superior quality. They are true to their words in delivering the work on designated time which exhibits a mark of true professionalism. We really appreciated the way they give their best shot in offering their services, because it saves us a lot of time. TUTIA has helped us keep a track on what our competitors were doing. Their team understands the client\'s needs and puts every possible effort in successfully performing the given task. They are very co-operative and flexible. TUTIA upheld their promise of hard work, dedication, discipline and quality. This company leaves no stone unturned when it comes to their services.',
        author: 'BDR',
        roleEn: 'Strategic Partner',
        roleAr: 'شريك استراتيجي',
        image: '/images/customers/bdr.png',
        rating: 5,
    },
    {
        quote: 'The professional relationship with our TUTIA content team has proven to be beneficial beyond our expectations. The lines of communication with our TUTIA project manager are always open and very effective, and the quality of work completed by the team is consistently of a high quality that meets our standards. There is no way we could easily manage the work volume required to keep our site current without the efforts of TUTIA. We look forward to continued successful working relationship with our TUTIA content team and would be comfortable recommending this company to others.',
        author: 'ICRC',
        roleEn: 'International Humanitarian Partner',
        roleAr: 'شريك إنساني دولي',
        image: '/images/customers/icrc.jpg',
        rating: 5,
    },
];

export function TestimonialsSection() {
    const { locale } = useI18n();

    return (
        <Section background="white" className="relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-40 -top-40 size-80 rounded-full bg-brand-gold-100/30 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 size-80 rounded-full bg-brand-navy-100/30 blur-3xl" />
            </div>

            <Container className="relative">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-gold-200 bg-brand-gold-50 px-4 py-1.5">
                        <Quote className="size-3.5 text-brand-gold-500" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold-600">
                            {locale === 'ar' ? 'شهادات العملاء' : 'CLIENT TESTIMONIALS'}
                        </span>
                    </div>
                    <Heading level="h2">
                        {locale === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}
                    </Heading>
                    <Text variant="body-lg" className="mt-3 text-neutral-500">
                        {locale === 'ar'
                            ? 'ثقة عملائنا هي دليل نجاحنا — اكتشف لماذا يثق بنا الشركاء حول العالم'
                            : 'Our clients\' trust is our proof of success — discover why partners worldwide trust us'}
                    </Text>
                </div>

                <div className="mt-14 grid gap-8 md:grid-cols-2">
                    {testimonials.map((item, index) => (
                        <div
                            key={index}
                            className="group relative"
                        >
                            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-brand-gold-300/40 via-brand-navy-500/20 to-brand-gold-300/40 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="relative rounded-2xl bg-white p-8 shadow-lg shadow-neutral-200/50 ring-1 ring-neutral-100 transition-all duration-300 group-hover:shadow-xl group-hover:ring-brand-gold-200/50 md:p-10">
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="flex gap-1">
                                        {Array.from({ length: item.rating }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className="size-4"
                                                fill="#EAB308"
                                                color="#EAB308"
                                            />
                                        ))}
                                    </div>
                                    <Quote className="size-8 text-brand-gold-200/60" />
                                </div>

                                <Text variant="body" className="leading-relaxed text-neutral-600">
                                    &ldquo;{item.quote}&rdquo;
                                </Text>

                                <div className="mt-8 flex items-center gap-5 border-t border-neutral-100 pt-6">
                                    <div className="relative shrink-0">
                                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-brand-gold-300 to-brand-navy-500 opacity-60 blur-sm" />
                                        <img
                                            src={item.image}
                                            alt={item.author}
                                            className="relative h-14 w-14 rounded-full border-2 border-white object-contain bg-white p-1"
                                        />
                                    </div>
                                    <div>
                                        <Text variant="body-sm" as="p" className="font-bold text-neutral-900">
                                            {item.author}
                                        </Text>
                                        <Text variant="body-sm" as="p" className="text-neutral-400">
                                            {locale === 'ar' ? item.roleAr : item.roleEn}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2 shadow-sm">
                        <span className="text-sm text-neutral-500">
                            {locale === 'ar'
                                ? 'انضم إلى أكثر من ١٠٠ شريك يثقون في توتيا'
                                : 'Join 100+ partners who trust TUTIA'}
                        </span>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
