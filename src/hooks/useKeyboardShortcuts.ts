import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface KeyboardShortcutHandlers {
    togglePlay: () => void;
    prevAyah: () => void;
    nextAyah: () => void;
    toggleSidebar: () => void;
    toggleFullscreen?: () => void;
    onEscape?: () => boolean; // Returns true if an open overlay was handled
}

export function useKeyboardShortcuts({ togglePlay, prevAyah, nextAyah, toggleSidebar, onEscape }: KeyboardShortcutHandlers) {
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

            // ⌘B / Ctrl+B toggle sidebar shortcut
            if ((e.metaKey || e.ctrlKey) && e.code === 'KeyB') {
                e.preventDefault();
                toggleSidebar();
                return;
            }

            // Jakob's Law: Escape always closes the topmost layer even when an input is focused
            if (e.code === 'Escape') {
                if (onEscape && onEscape()) {
                    e.preventDefault();
                    return;
                }
                if (isFullscreenTranslation) {
                    e.preventDefault();
                    setIsFullscreenTranslation(false);
                    return;
                }
                if (window.innerWidth < 768) {
                    e.preventDefault();
                    toggleSidebar();
                    return;
                }
            }

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
        onEscape,
        isFullscreenTranslation,
        setIsFullscreenTranslation,
        fullscreenLayoutMode,
        setFullscreenLayoutMode,
        translationFontSize,
        setTranslationFontSize
    ]);
}
