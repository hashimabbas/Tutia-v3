import { useRef, useState, useEffect } from 'react';
import type { RefObject } from 'react';

export function useIntersection<T extends HTMLElement = HTMLDivElement>(
    options?: IntersectionObserverInit,
): [RefObject<T | null>, boolean] {
    const ref = useRef<T | null>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => observer.disconnect();
    }, [options]);

    return [ref, isIntersecting];
}
