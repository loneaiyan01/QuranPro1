import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
    togglePlay: () => void;
    prevAyah: () => void;
    nextAyah: () => void;
    toggleSidebar: () => void;
}

export function useKeyboardShortcuts({ togglePlay, prevAyah, nextAyah, toggleSidebar }: KeyboardShortcutHandlers) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevAyah();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextAyah();
                    break;
                case 'Escape':
                    e.preventDefault();
                    toggleSidebar();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, prevAyah, nextAyah, toggleSidebar]);
}
