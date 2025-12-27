import React, { useEffect, useState } from 'react';
import { Reciter, Surah } from '../types';

interface DynamicIslandProps {
    isPlaying: boolean;
    reciter: Reciter | null;
    currentSurah: Surah | null;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ isPlaying, reciter, currentSurah }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (isPlaying) {
            setIsVisible(true);
            const timer = setTimeout(() => setIsExpanded(false), 3000);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isPlaying]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <div
                className={`
          flex items-center gap-3 bg-black/90 backdrop-blur-md px-4 py-2 rounded-full 
          transition-all duration-500 ease-[cubic-bezier(0.4, 0, 0.2, 1)] border border-white/10 shadow-2xl
          ${isExpanded ? 'w-64' : 'w-auto max-w-[200px]'}
        `}
                style={{ pointerEvents: 'auto' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Visualizer Icon */}
                <div className="flex gap-0.5 items-end h-3 w-4 shrink-0">
                    <div className={`w-0.5 bg-emerald-400 ${isPlaying ? 'animate-[music-bar_0.8s_infinite]' : 'h-1'}`} />
                    <div className={`w-0.5 bg-emerald-400 ${isPlaying ? 'animate-[music-bar_1.2s_infinite]' : 'h-2'}`} />
                    <div className={`w-0.5 bg-emerald-400 ${isPlaying ? 'animate-[music-bar_1.0s_infinite]' : 'h-1.5'}`} />
                </div>

                {/* Info */}
                <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-widest leading-none mb-0.5">
                        {isPlaying ? 'Playing' : 'Paused'}
                    </span>
                    <h4 className="text-white text-xs font-bold truncate leading-tight">
                        {reciter?.englishName || 'Reciter'}
                    </h4>
                    {isExpanded && (
                        <p className="text-white/60 text-[10px] truncate animate-fadeIn">
                            {currentSurah?.englishName || 'Surah'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DynamicIsland;
