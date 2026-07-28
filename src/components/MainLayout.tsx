import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import ScrollingVerseDisplay from './ScrollingVerseDisplay';
import PlayerControls from './PlayerControls';
import { HomePage } from './HomePage';
import { BookmarksPage } from './BookmarksPage';
import { SettingsPage } from './SettingsPage';
import { RadioPage } from './RadioPage';
import { MiniPlayer } from './MiniPlayer';
import { Menu, Tv, Home, BookOpen, Radio, Bookmark as BookmarkIcon, Settings } from 'lucide-react';
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

    // Close sidebar on page change
    React.useEffect(() => {
        setIsSidebarOpen(false);
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

            {/* Sidebar (Desktop navigation menu) */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full transition-all duration-300 relative min-w-0 overflow-x-hidden">

                {/* Top Header Bar for Mobile & Desktop */}
                <header className="fixed top-0 inset-x-0 h-16 px-4 sm:px-6 md:px-8 bg-[var(--bg-sidebar)]/90 backdrop-blur-md border-b border-[var(--border)] z-30 flex items-center justify-between shadow-xs">
                    {/* Website Logo & Navigation Links (Left) */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <button
                            onClick={() => quranActions.resetToHome()}
                            className="text-lg sm:text-xl font-sans font-bold text-accent hover:opacity-80 transition-opacity bg-transparent border-none p-0 cursor-pointer flex items-center gap-2"
                        >
                            HearQuran
                        </button>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-1">
                            <button
                                onClick={() => quranActions.setCurrentPage('home')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                    currentPage === 'home'
                                        ? 'bg-accent-muted text-accent'
                                        : 'text-muted hover:text-main hover:bg-white/5'
                                }`}
                            >
                                <Home className="w-3.5 h-3.5" />
                                <span>Home</span>
                            </button>
                            <button
                                onClick={() => quranActions.setCurrentPage('player')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                    currentPage === 'player'
                                        ? 'bg-accent-muted text-accent'
                                        : 'text-muted hover:text-main hover:bg-white/5'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Player</span>
                            </button>
                            <button
                                onClick={() => quranActions.toggleRadioMode(true)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                    currentPage === 'radio'
                                        ? 'bg-accent-muted text-accent'
                                        : 'text-muted hover:text-main hover:bg-white/5'
                                }`}
                            >
                                <Radio className="w-3.5 h-3.5" />
                                <span>Radio</span>
                            </button>
                            <button
                                onClick={() => quranActions.setCurrentPage('bookmarks')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                    currentPage === 'bookmarks'
                                        ? 'bg-accent-muted text-accent'
                                        : 'text-muted hover:text-main hover:bg-white/5'
                                }`}
                            >
                                <BookmarkIcon className="w-3.5 h-3.5" />
                                <span>Reflections</span>
                            </button>
                            <button
                                onClick={() => quranActions.setCurrentPage('settings')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                    currentPage === 'settings'
                                        ? 'bg-accent-muted text-accent'
                                        : 'text-muted hover:text-main hover:bg-white/5'
                                }`}
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Settings</span>
                            </button>
                        </nav>
                    </div>

                    {/* Action Controls & Sidebar Toggle (Right) */}
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
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2.5 bg-accent text-white rounded-xl shadow-md shadow-accent/20 active:scale-95 transition-transform flex items-center justify-center cursor-pointer md:hidden"
                            title={isSidebarOpen ? "Close Quick Menu" : "Open Quick Menu"}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </header>

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
