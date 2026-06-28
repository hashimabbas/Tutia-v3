import { Link } from '@inertiajs/react';
import { Fragment } from 'react';

type BreadcrumbItem = {
    label: string;
    href: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb">
            <ol
                vocab="https://schema.org/"
                typeof="BreadcrumbList"
                className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
            >
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <Fragment key={item.href}>
                            <li
                                property="itemListElement"
                                typeof="ListItem"
                                className="inline-flex items-center"
                            >
                                {isLast ? (
                                    <span
                                        property="item"
                                        typeof="WebPage"
                                        className="font-medium text-foreground"
                                    >
                                        <span property="name">
                                            {item.label}
                                        </span>
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        property="item"
                                        typeof="WebPage"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        <span property="name">
                                            {item.label}
                                        </span>
                                    </Link>
                                )}
                                <meta
                                    property="position"
                                    content={String(index + 1)}
                                />
                            </li>
                            {!isLast && (
                                <span
                                    className="mx-1 text-muted-foreground/50 select-none"
                                    aria-hidden="true"
                                >
                                    /
                                </span>
                            )}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
