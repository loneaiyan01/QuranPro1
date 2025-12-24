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

    const isUserInteracting = useRef(false);
    const isAutoScrolling = useRef(false);
    const interactionTimeout = useRef<NodeJS.Timeout | null>(null);



    const scrollOffset = useRef(0);

    // Handle manual scroll detection
    const handleScroll = () => {
        if (isAutoScrolling.current) {
            isAutoScrolling.current = false; // Reset flag
            return;
        }

        // User is scrolling manually
        isUserInteracting.current = true;

        // Clear existing timeout
        if (interactionTimeout.current) {
            clearTimeout(interactionTimeout.current);
        }

        // Resume auto-scroll after 4 seconds
        interactionTimeout.current = setTimeout(() => {
            isUserInteracting.current = false;

            // Recalculate offset when user stops scrolling
            // New Target = (Total * Progress) + Offset
            // So: Offset = CurrentPos - (Total * Progress)
            if (containerRef.current && duration > 0) {
                const container = containerRef.current;
                const scrollHeight = container.scrollHeight - container.clientHeight;
                const calculatedPos = scrollHeight * (currentTime / duration);
                scrollOffset.current = container.scrollTop - calculatedPos;
            }
        }, 4000);
    };

    // Auto-scroll logic
    useEffect(() => {
        // Reset offset on new surah or start
        if (currentTime < 1) {
            scrollOffset.current = 0;
        }

        // Don't auto-scroll if user is interacting
        if (isUserInteracting.current) return;

        if (isPlaying && containerRef.current && duration > 0) {
            const container = containerRef.current;
            const scrollHeight = container.scrollHeight - container.clientHeight;

            const progress = currentTime / duration;
            // Apply the user's manual offset to the calculated position
            const targetScrollTop = (scrollHeight * progress) + scrollOffset.current;

            // Only scroll if the difference is significant
            if (Math.abs(container.scrollTop - targetScrollTop) > 10) {
                isAutoScrolling.current = true;
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
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-2 py-4 lg:px-12 scroll-smooth"
        >
            <div className="max-w-4xl mx-auto space-y-4 pb-32">
                <div className="text-center mb-6">
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
                        className={`p-4 rounded-xl transition-colors duration-500 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent`}
                    >
                        {/* Header: Verse Number */}
                        <div className="flex justify-between items-center mb-2 opacity-50">
                            <span className="text-[10px] font-mono bg-gray-200 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                                {ayah.numberInSurah}
                            </span>
                        </div>

                        {/* Arabic Text */}
                        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ARABIC_ONLY) && (
                            <p className="text-right font-amiri text-2xl leading-[2.2] mb-3 text-slate-800 dark:text-slate-100" dir="rtl">
                                {ayah.text}
                            </p>
                        )}

                        {/* English Text */}
                        {(displayMode === DisplayMode.BOTH || displayMode === DisplayMode.ENGLISH_ONLY) && englishSurah?.ayahs[index] && (
                            <p className="text-left font-sans text-base leading-relaxed text-slate-600 dark:text-slate-300">
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
