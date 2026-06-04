import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import ScrollingVerseDisplay from './ScrollingVerseDisplay';
import PlayerControls from './PlayerControls';
import { HomePage } from './HomePage';
import { BookmarksPage } from './BookmarksPage';
import { SettingsPage } from './SettingsPage';
import { RadioPage } from './RadioPage';
import { MiniPlayer } from './MiniPlayer';
import { ResumePrompt } from './ResumePrompt';
import { Menu, Tv, Home, BookOpen, Radio, Bookmark, Settings } from 'lucide-react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import FullscreenTranslationView from './FullscreenTranslationView';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const MainLayout: React.FC = () => {
    // Local UI State for Sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const { isRadioMode, currentSurah, currentPage, actions: quranActions } = useQuran();
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
        // Right swipe (open sidebar - only if not on homepage)
        if (distance < -minSwipeDistance && !isSidebarOpen && currentPage !== 'home') {
            setIsSidebarOpen(true);
        }
    }, [touchStartX, touchEndX, isSidebarOpen, currentPage]);

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

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage />;
            case 'player':
                if (!currentSurah) {
                    return (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-sm mx-auto animate-in fade-in duration-500">
                            <div className="w-16 h-16 rounded-2xl bg-accent-muted text-accent flex items-center justify-center">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-serif font-bold text-main">No Surah Selected</h3>
                                <p className="text-xs text-muted leading-relaxed">
                                    Select a Surah from the library on the home dashboard to load the verse player.
                                </p>
                            </div>
                            <button
                                onClick={() => quranActions.setCurrentPage('home')}
                                className="w-full py-3 bg-accent text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-accent/15"
                            >
                                Browse Surahs
                            </button>
                        </div>
                    );
                }
                return <ScrollingVerseDisplay />;
            case 'radio':
                return <RadioPage />;
            case 'bookmarks':
                return <BookmarksPage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <HomePage />;
        }
    };

    const isHome = currentPage === 'home';

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

            {/* Sidebar (Desktop navigation menu) */}
            {!isHome && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 relative ${!isHome && isSidebarOpen ? 'md:ml-80' : ''}`}>

                {/* Top Mobile Bar */}
                <div className="md:hidden absolute top-0 inset-x-0 p-4 z-20 flex justify-between pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                        {!isHome && (
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="p-3 bg-accent text-white rounded-full shadow-lg shadow-accent/20 backdrop-blur-md active:scale-95 transition-transform"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        {!isHome && (
                            <button
                                onClick={() => quranActions.resetToHome()}
                                className="p-3 bg-accent text-white rounded-full shadow-lg shadow-accent/20 backdrop-blur-md active:scale-95 transition-transform"
                                title="Go to Homepage"
                            >
                                <Home className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    {currentPage === 'player' && currentSurah && (
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
                    {!isHome && (
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    {!isHome && (
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
                    {currentPage === 'player' && currentSurah && (
                        <button
                            onClick={() => setIsFullscreenTranslation(true)}
                            className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title="Fullscreen Translation Mode"
                        >
                            <Tv className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {/* Dynamic Page Container */}
                <main className="flex-1 flex flex-col relative min-h-0 overflow-hidden pb-16 md:pb-0">
                    {renderPage()}
                </main>

                {/* Player Controls (visible on Player/Radio views only) */}
                {(currentPage === 'player' || currentPage === 'radio') && currentSurah && (
                    <PlayerControls />
                )}

                {/* Floating Mini Player (visible on other views when audio is active) */}
                {currentSurah && currentPage !== 'player' && currentPage !== 'radio' && (
                    <MiniPlayer />
                )}

                {/* Mobile Bottom Navigation Bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1C1C1E] border-t border-[var(--border)] flex justify-around items-center z-40 px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
                    <button
                        onClick={() => quranActions.setCurrentPage('home')}
                        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors active:scale-95 ${
                            currentPage === 'home' ? 'text-accent' : 'text-muted hover:text-main'
                        }`}
                    >
                        <Home className="w-5 h-5" />
                        <span className="text-[9px] font-bold">Home</span>
                    </button>
                    <button
                        onClick={() => quranActions.setCurrentPage('player')}
                        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors active:scale-95 ${
                            currentPage === 'player' ? 'text-accent' : 'text-muted hover:text-main'
                        }`}
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="text-[9px] font-bold">Player</span>
                    </button>
                    <button
                        onClick={() => quranActions.setCurrentPage('radio')}
                        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors active:scale-95 ${
                            currentPage === 'radio' ? 'text-accent' : 'text-muted hover:text-main'
                        }`}
                    >
                        <Radio className="w-5 h-5" />
                        <span className="text-[9px] font-bold">Radio</span>
                    </button>
                    <button
                        onClick={() => quranActions.setCurrentPage('bookmarks')}
                        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors active:scale-95 ${
                            currentPage === 'bookmarks' ? 'text-accent' : 'text-muted hover:text-main'
                        }`}
                    >
                        <Bookmark className="w-5 h-5" />
                        <span className="text-[9px] font-bold">Saved</span>
                    </button>
                    <button
                        onClick={() => quranActions.setCurrentPage('settings')}
                        className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors active:scale-95 ${
                            currentPage === 'settings' ? 'text-accent' : 'text-muted hover:text-main'
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                        <span className="text-[9px] font-bold">Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
