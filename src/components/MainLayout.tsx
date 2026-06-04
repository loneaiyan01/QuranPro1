import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import ScrollingVerseDisplay from './ScrollingVerseDisplay';
import PlayerControls from './PlayerControls';
import RadioInterface from './RadioInterface';
import { HomePage } from './HomePage';
import { ResumePrompt } from './ResumePrompt';
import { Menu, Tv, Home } from 'lucide-react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import FullscreenTranslationView from './FullscreenTranslationView';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const MainLayout: React.FC = () => {
    // Local UI State for Sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const { isRadioMode, currentSurah, actions: quranActions } = useQuran();
    const { isFullscreenTranslation, setIsFullscreenTranslation } = useTheme();

    // Swipe gestures on mobile
    const [touchStartX, setTouchStartX] = useState<number | null>(null);
    const [touchEndX, setTouchEndX] = useState<number | null>(null);

    const onTouchStart = useCallback((e: React.TouchEvent) => {
        setTouchEndX(null);
        setTouchStartX(e.targetTouches[0].clientX);
    }, []);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        setTouchEndX(e.targetTouches[0].clientX);
    }, []);

    const onTouchEnd = useCallback(() => {
        if (touchStartX === null || touchEndX === null) return;
        const distance = touchStartX - touchEndX;
        const minSwipeDistance = 60; // minimum distance in px to trigger swipe

        // Left swipe (close sidebar)
        if (distance > minSwipeDistance && isSidebarOpen) {
            setIsSidebarOpen(false);
        }
        // Right swipe (open sidebar - only if player is active)
        if (distance < -minSwipeDistance && !isSidebarOpen && currentSurah) {
            setIsSidebarOpen(true);
        }
    }, [touchStartX, touchEndX, isSidebarOpen, currentSurah]);

    // Initial sidebar state based on screen width (checking on mount)
    React.useEffect(() => {
        if (window.innerWidth >= 768) {
            setIsSidebarOpen(true);
        }
    }, []);

    const { actions: { togglePlay, nextAyah, prevAyah } } = useAudio();
    const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
    const toggleFullscreen = useCallback(() => setIsFullscreenTranslation(!isFullscreenTranslation), [isFullscreenTranslation, setIsFullscreenTranslation]);
    useKeyboardShortcuts({ togglePlay, prevAyah, nextAyah, toggleSidebar, toggleFullscreen });

    return (
        <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="flex h-[100dvh] w-full relative overflow-hidden"
        >
            {/* Fullscreen Translation Overlay */}
            {isFullscreenTranslation && <FullscreenTranslationView />}

            {/* Resume Session Toast */}
            <ResumePrompt />

            {/* Sidebar */}
            {currentSurah && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 relative ${currentSurah && isSidebarOpen ? 'md:ml-80' : ''}`}>

                {/* Top Mobile Bar */}
                <div className="md:hidden absolute top-0 inset-x-0 p-4 z-20 flex justify-between pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        {currentSurah && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 bg-accent text-white rounded-full shadow-lg shadow-accent/20 backdrop-blur-md active:scale-95 transition-transform"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        {currentSurah && (
                            <button
                                onClick={() => quranActions.resetToHome()}
                                className="p-3 bg-accent text-white rounded-full shadow-lg shadow-accent/20 backdrop-blur-md active:scale-95 transition-transform"
                                title="Go to Homepage"
                            >
                                <Home className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    {currentSurah && (
                        <button
                            onClick={() => setIsFullscreenTranslation(true)}
                            className="p-3 bg-accent text-white rounded-full shadow-lg shadow-accent/20 backdrop-blur-md active:scale-95 transition-transform pointer-events-auto"
                            title="Fullscreen Translation Mode"
                        >
                            <Tv className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Desktop/Tablet Sidebar Toggle & Home Button */}
                <div className="hidden md:flex items-center gap-2 absolute top-4 left-4 z-20">
                    {currentSurah && (
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    {currentSurah && (
                        <button
                            onClick={() => quranActions.resetToHome()}
                            className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title="Go to Homepage"
                        >
                            <Home className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Desktop/Tablet Fullscreen Translation Toggle */}
                <div className="hidden md:block absolute top-4 right-4 z-20">
                    {currentSurah && (
                        <button
                            onClick={() => setIsFullscreenTranslation(true)}
                            className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title="Fullscreen Translation Mode"
                        >
                            <Tv className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Verse Display Area / Radio Interface / Homepage */}
                <main className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
                    {currentSurah ? (
                        isRadioMode ? <RadioInterface /> : <ScrollingVerseDisplay />
                    ) : (
                        <HomePage />
                    )}
                </main>

                {/* Player Controls */}
                {currentSurah && <PlayerControls />}
            </div>
        </div>
    );
};

export default MainLayout;
