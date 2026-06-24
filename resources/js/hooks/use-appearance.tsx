export type ResolvedAppearance = 'light';

export type UseAppearanceReturn = {
    readonly appearance: 'light';
    readonly resolvedAppearance: ResolvedAppearance;
};

export function initializeTheme(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
}

export function useAppearance(): UseAppearanceReturn {
    return { appearance: 'light', resolvedAppearance: 'light' } as const;
}
