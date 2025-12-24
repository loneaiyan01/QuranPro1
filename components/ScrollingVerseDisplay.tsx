import React, { useEffect, useRef, useState } from 'react';
import { Surah, SurahContent, Ayah, DisplayMode } from '../types';

interface ScrollingVerseDisplayProps {
    arabicSurah: SurahContent | undefined;
    englishSurah: SurahContent | undefined;
    displayMode: DisplayMode;
    isLoading: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
}

const ScrollingVerseDisplay: React.FC<ScrollingVerseDisplayProps> = ({
    arabicSurah,
    englishSurah,
    displayMode,
    isLoading,
    isPlaying,
    currentTime,
    duration,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [totalWords, setTotalWords] = useState(0);

    // Calculate total words when content loads to estimate scroll speed
    useEffect(() => {
        if (arabicSurah) {
            const words = arabicSurah.ayahs.reduce((count, ayah) => {
                return count + ayah.text.split(' ').length;
            }, 0);
            setTotalWords(words);
        }
    }, [arabicSurah]);

    // Auto-scroll logic
    useEffect(() => {
        if (isPlaying && containerRef.current && duration > 0) {
            const container = containerRef.current;
            const scrollHeight = container.scrollHeight - container.clientHeight;

            // Calculate target scroll position based on playback progress
            // We assume reading speed is roughly constant relative to audio time
            const progress = currentTime / duration;
            const targetScrollTop = scrollHeight * progress;

            // Smoothly scroll to target
            // We use a small threshold to avoid jitter if user tries to scroll manually
            if (Math.abs(container.scrollTop - targetScrollTop) > 50) {
                // If difference is huge, maybe user jumped or just started.
                // In a real sophisticated app we'd detect manual scroll interactions
                // and pause auto-scroll. For now, we'll just soft update.
                container.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTop = targetScrollTop;
            }
        }
    }, [currentTime, duration, isPlaying]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!arabicSurah) return null;

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 py-8 lg:px-20 scroll-smooth"
        >
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
                <div className="text-center mb-8">
                    <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-emerald-900/30 text-xs rounded-full text-gray-500 dark:text-emerald-400 mb-2">
                        Scrolling Mode
                    </span>
                    <p className="text-xs text-gray-400">
                        Audio is continuous. Text scrolls automatically.
                    </p>
                </div>

                {arabicSurah.ayahs.map((ayah, index) => (
                    <div
                        key={ayah.number}
                        className={`p-6 rounded-2xl transition-colors duration-500 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent`}
                    >
                        {/* Header: Verse Number */}
                        <div className="flex justify-between items-center mb-4 opacity-50">
                            <span className="text-xs font-mono bg-gray-200 dark:bg-emerald-900/50 px-2 py-1 rounded-full">
                                {ayah.numberInSurah}
                            </span>
                        </div>

                        {/* Arabic Text */}
                        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ARABIC_ONLY) && (
                            <p className="text-right font-amiri text-3xl leading-[2.5] mb-6 text-slate-800 dark:text-slate-100" dir="rtl">
                                {ayah.text}
                            </p>
                        )}

                        {/* English Text */}
                        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ENGLISH_ONLY) && englishSurah?.ayahs[index] && (
                            <p className="text-left font-sans text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                {englishSurah.ayahs[index].text}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollingVerseDisplay;
