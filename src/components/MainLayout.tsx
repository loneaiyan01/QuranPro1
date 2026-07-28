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
import { Menu, Tv, Home, BookOpen } from 'lucide-react';
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

    // Update sidebar state when page changes (closed on home, open on other pages on desktop)
    React.useEffect(() => {
        if (window.innerWidth >= 768 && currentPage !== 'home') {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [currentPage]);

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
                                <h3 className="text-lg font-sans font-bold text-main">No Surah Selected</h3>
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
        <div className="flex h-[100dvh] w-full relative overflow-hidden">
            {/* Fullscreen Translation Overlay */}
            {isFullscreenTranslation && <FullscreenTranslationView />}

            {/* Resume Session Toast */}
            <ResumePrompt />

            {/* Sidebar (Desktop navigation menu) */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 relative min-w-0 overflow-x-hidden ${isSidebarOpen ? 'md:mr-80' : ''}`}>

                {/* Top Mobile Bar */}
                <div className="md:hidden fixed top-0 inset-x-0 h-16 px-4 bg-[var(--bg-sidebar)]/90 backdrop-blur-md border-b border-[var(--border)] z-30 flex items-center justify-between shadow-xs">
                    {/* Website Name on Left */}
                    <button
                        onClick={() => quranActions.resetToHome()}
                        className="text-lg font-sans font-bold text-accent hover:opacity-80 transition-opacity bg-transparent border-none p-0 cursor-pointer flex items-center gap-2"
                    >
                        HearQuran
                    </button>

                    {/* Controls & Sidebar Toggle on Right */}
                    <div className="flex items-center gap-2">
                        {!isHome && (
                            <button
                                onClick={() => quranActions.resetToHome()}
                                className="p-2 text-muted hover:text-main rounded-lg hover:bg-white/5 transition-colors"
                                title="Go to Homepage"
                            >
                                <Home className="w-5 h-5" />
                            </button>
                        )}
                        {currentPage === 'player' && currentSurah && (
                            <button
                                onClick={() => setIsFullscreenTranslation(true)}
                                className="p-2 text-muted hover:text-main rounded-lg hover:bg-white/5 transition-colors"
                                title="Fullscreen Translation Mode"
                            >
                                <Tv className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 bg-accent text-white rounded-xl shadow-md shadow-accent/20 active:scale-95 transition-transform flex items-center justify-center"
                            title="Open Sidebar"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Desktop/Tablet Home Button */}
                <div className="hidden md:flex items-center gap-2 absolute top-4 left-4 z-20">
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

                {/* Desktop/Tablet Sidebar Toggle & Controls */}
                <div className="hidden md:flex items-center gap-2 absolute top-4 right-4 z-20">
                    {currentPage === 'player' && currentSurah && (
                        <button
                            onClick={() => setIsFullscreenTranslation(true)}
                            className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title="Fullscreen Translation Mode"
                        >
                            <Tv className="w-6 h-6" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Dynamic Page Container */}
                <main className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
                    {renderPage()}
                </main>

                {/* Player Controls (visible on Player view only) */}
                {currentPage === 'player' && currentSurah && (
                    <PlayerControls />
                )}

                {/* Floating Mini Player (visible on other views when audio is active) */}
                {currentSurah && currentPage !== 'player' && currentPage !== 'radio' && (
                    <MiniPlayer />
                )}
            </div>
        </div>
    );
};

export default MainLayout;
