import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface KeyboardShortcutHandlers {
    togglePlay: () => void;
    prevAyah: () => void;
    nextAyah: () => void;
    toggleSidebar: () => void;
    toggleFullscreen?: () => void;
}

export function useKeyboardShortcuts({ togglePlay, prevAyah, nextAyah, toggleSidebar }: KeyboardShortcutHandlers) {
    const {
        isFullscreenTranslation,
        setIsFullscreenTranslation,
        fullscreenLayoutMode,
        setFullscreenLayoutMode,
        translationFontSize,
        setTranslationFontSize
    } = useTheme();

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
                    if (isFullscreenTranslation) {
                        setIsFullscreenTranslation(false);
                    } else {
                        toggleSidebar();
                    }
                    break;
                case 'KeyF':
                    e.preventDefault();
                    setIsFullscreenTranslation(!isFullscreenTranslation);
                    break;
                case 'KeyL':
                    if (isFullscreenTranslation) {
                        e.preventDefault();
                        setFullscreenLayoutMode(fullscreenLayoutMode === 'single' ? 'scroll' : 'single');
                    }
                    break;
                case 'Equal':
                case 'NumpadAdd':
                    if (isFullscreenTranslation) {
                        e.preventDefault();
                        setTranslationFontSize(Math.min(translationFontSize + 2, 64));
                    }
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    if (isFullscreenTranslation) {
                        e.preventDefault();
                        setTranslationFontSize(Math.max(translationFontSize - 2, 16));
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        togglePlay,
        prevAyah,
        nextAyah,
        toggleSidebar,
        isFullscreenTranslation,
        setIsFullscreenTranslation,
        fullscreenLayoutMode,
        setFullscreenLayoutMode,
        translationFontSize,
        setTranslationFontSize
    ]);
}
