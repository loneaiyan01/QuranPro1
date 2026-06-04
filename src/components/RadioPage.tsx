import React, { useEffect, useState } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { Radio, ChevronRight, Volume2, Music, Play, AlertCircle } from 'lucide-react';

export const RadioPage: React.FC = () => {
    const { currentSurah, selectedReciter, actions, isRadioMode } = useQuran();
    const { isPlaying, isBuffering } = useAudio();
    const [randomSeed, setRandomSeed] = useState(0);

    // Update aesthetic animations periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setRandomSeed(prev => (prev + 1) % 100);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // 1. Inactive State (Show Call to Action)
    if (!isRadioMode) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 rounded-full bg-accent-muted flex items-center justify-center relative">
                    <Radio className="w-12 h-12 text-accent" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-main">Quran Live Radio</h2>
                    <p className="text-sm text-muted leading-relaxed px-4">
                        Immerse yourself in a continuous stream of random Surahs. Ideal for reflective background listening, learning, or relaxing.
                    </p>
                </div>
                <button
                    onClick={() => actions.toggleRadioMode(true)}
                    className="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-2xl shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    Enter Radio Mode
                </button>
            </div>
        );
    }

    // 2. Loading State (If active but Surah hasn't loaded yet)
    if (!currentSurah || !selectedReciter) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
        );
    }

    // 3. Active State (Show Visualizer & Orbiting elements)
    return (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-transparent to-accent/5 p-6 text-center">

            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] -top-40 -right-40 animate-pulse transition-all duration-1000"
                    style={{ transform: `scale(${1 + Math.sin(randomSeed / 10) * 0.1})` }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full bg-[var(--accent-muted)] blur-[100px] -bottom-20 -left-20 animate-pulse transition-all duration-1000 delay-700"
                    style={{ transform: `scale(${1 + Math.cos(randomSeed / 15) * 0.15})` }}
                />
            </div>

            {/* Main Content Card */}
            <div className="z-10 max-w-2xl w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">

                {/* Mode Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
                    <Radio className="w-4 h-4 text-accent animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-accent">Radio Mode Active</span>
                </div>

                {/* Reciter Avatar / Icon Area */}
                <div className="relative">
                    <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full bg-[var(--bg-main)] shadow-2xl flex items-center justify-center border-4 border-[var(--border)] relative ${isPlaying && !isBuffering ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
                        <Music className="w-12 h-12 md:w-20 md:h-20 text-accent/20" />

                        {/* Orbiting particles when playing */}
                        {isPlaying && !isBuffering && [0, 1, 2].map(i => (
                            <div
                                key={i}
                                className="absolute w-3 h-3 bg-accent rounded-full blur-sm"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    margin: '-6px',
                                    animation: `orbit-${i} 4s linear infinite`,
                                    animationDelay: `${i * 1.3}s`
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Info Text */}
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-main tracking-tight leading-tight">
                        {currentSurah.englishName}
                    </h2>
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-lg md:text-2xl text-accent font-medium opacity-90">
                            {selectedReciter.name}
                        </p>
                        <p className="text-sm text-muted font-sans tracking-wide">
                            {currentSurah.englishNameTranslation}
                        </p>
                    </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-xs">
                    <button
                        onClick={() => actions.nextRadioSurah()}
                        className="group flex items-center justify-center gap-3 w-full py-4 px-6 bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-3xl shadow-[var(--shadow-lg)] hover:shadow-[var(--accent)]/10 hover:border-[var(--border-active)] hover:bg-[var(--bg-card-active)] transition-all duration-300 active:scale-95"
                    >
                        <span className="font-bold text-main text-sm">Play Next Random</span>
                        <ChevronRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => actions.toggleRadioMode(false)}
                        className="text-xs font-semibold text-muted hover:text-accent transition-colors py-2"
                    >
                        Deactivate Radio Mode
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes orbit-0 {
                    from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
                }
                @keyframes orbit-1 {
                    from { transform: rotate(120deg) translateX(110px) rotate(-120deg); }
                    to { transform: rotate(480deg) translateX(110px) rotate(-480deg); }
                }
                @keyframes orbit-2 {
                    from { transform: rotate(240deg) translateX(90px) rotate(-240deg); }
                    to { transform: rotate(600deg) translateX(90px) rotate(-600deg); }
                }
                @media (max-width: 768px) {
                    @keyframes orbit-0 {
                        from { transform: rotate(0deg) translateX(70px) rotate(0deg); }
                        to { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
                    }
                    @keyframes orbit-1 {
                        from { transform: rotate(120deg) translateX(75px) rotate(-120deg); }
                        to { transform: rotate(480deg) translateX(75px) rotate(-480deg); }
                    }
                    @keyframes orbit-2 {
                        from { transform: rotate(240deg) translateX(65px) rotate(-240deg); }
                        to { transform: rotate(600deg) translateX(65px) rotate(-600deg); }
                    }
                }
            `}</style>
        </div>
    );
};
