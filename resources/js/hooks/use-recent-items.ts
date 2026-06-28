import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tutia:recent-items';
const MAX_ITEMS = 10;

export interface RecentItem {
    title: string;
    href: string;
    timestamp: number;
}

export function useRecentItems() {
    const [items, setItems] = useState<RecentItem[]>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // storage full or unavailable
        }
    }, [items]);

    const addItem = useCallback((title: string, href: string) => {
        setItems((prev) => {
            const filtered = prev.filter((i) => i.href !== href);
            return [{ title, href, timestamp: Date.now() }, ...filtered].slice(
                0,
                MAX_ITEMS,
            );
        });
    }, []);

    const removeItem = useCallback((href: string) => {
        setItems((prev) => prev.filter((i) => i.href !== href));
    }, []);

    const clearAll = useCallback(() => {
        setItems([]);
    }, []);

    return { items, addItem, removeItem, clearAll };
}
