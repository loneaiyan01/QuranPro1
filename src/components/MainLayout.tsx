import React, { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import ScrollingVerseDisplay from './ScrollingVerseDisplay';
import PlayerControls from './PlayerControls';
import RadioInterface from './RadioInterface';
import { ResumePrompt } from './ResumePrompt';
import { Menu, Tv } from 'lucide-react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import FullscreenTranslationView from './FullscreenTranslationView';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

const MainLayout: React.FC = () => {
    // Local UI State for Sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const { isRadioMode } = useQuran();
    const { isFullscreenTranslation, setIsFullscreenTranslation } = useTheme();

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
        <div className="flex h-screen w-full relative overflow-hidden">
            {/* Fullscreen Translation Overlay */}
            {isFullscreenTranslation && <FullscreenTranslationView />}

            {/* Resume Session Toast */}
            <ResumePrompt />

            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-full transition-all duration-300 relative ${isSidebarOpen ? 'md:ml-80' : ''}`}>

                {/* Top Mobile Bar */}
                <div className="md:hidden absolute top-0 inset-x-0 p-4 z-20 flex justify-between pointer-events-none">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-3 bg-accent text-white rounded-full shadow-lg shadow-accent/20 backdrop-blur-md active:scale-95 transition-transform pointer-events-auto"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => setIsFullscreenTranslation(true)}
                        className="p-3 bg-accent text-white rounded-full shadow-lg shadow-accent/20 backdrop-blur-md active:scale-95 transition-transform pointer-events-auto"
                        title="Fullscreen Translation Mode"
                    >
                        <Tv className="w-6 h-6" />
                    </button>
                </div>

                {/* Desktop/Tablet Sidebar Toggle */}
                <div className="hidden md:block absolute top-4 left-4 z-20">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        title={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Desktop/Tablet Fullscreen Translation Toggle */}
                <div className="hidden md:block absolute top-4 right-4 z-20">
                    <button
                        onClick={() => setIsFullscreenTranslation(true)}
                        className="p-2 bg-transparent hover:bg-[var(--bg-card-active)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        title="Fullscreen Translation Mode"
                    >
                        <Tv className="w-6 h-6" />
                    </button>
                </div>

                {/* Verse Display Area / Radio Interface */}
                <main className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
                    {isRadioMode ? <RadioInterface /> : <ScrollingVerseDisplay />}
                </main>

                {/* Player Controls */}
                <PlayerControls />
            </div>
        </div>
    );
};

export default MainLayout;
