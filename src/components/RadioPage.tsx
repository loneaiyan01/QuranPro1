import React, { useEffect, useState } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { Radio, Music } from 'lucide-react';

export const RadioPage: React.FC = () => {
    const { currentSurah, selectedReciter, surahText, actions, isRadioMode } = useQuran();
    const { isPlaying, isBuffering, currentAyahIndex } = useAudio();
    const [randomSeed, setRandomSeed] = useState(0);

    // Auto-activate radio mode when user lands on this page
    useEffect(() => {
        if (!isRadioMode) {
            actions.toggleRadioMode(true);
        }
    }, [isRadioMode, actions]);

    // Update aesthetic animations periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setRandomSeed(prev => (prev + 1) % 100);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // 1. Loading State (If active but Surah/text hasn't loaded yet)
    if (!isRadioMode || !currentSurah || !selectedReciter || !surahText) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
        );
    }

    // Safely retrieve current ayah texts
    const arabicAyah = surahText.arabic.ayahs[currentAyahIndex] || surahText.arabic.ayahs[0];
    const englishAyah = surahText.english.ayahs[currentAyahIndex] || surahText.english.ayahs[0];

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-transparent to-accent/5 p-6 pt-24 pb-28 text-center">

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

            {/* Main Content Area */}
            <div className="z-10 w-full max-w-3xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                
                {/* Header Information */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                        <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Quran Live Radio</span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-main mt-2 tracking-tight">
                        {currentSurah.englishName}
                    </h1>
                    
                    <p className="text-xs text-muted tracking-wide">
                        Verse {currentAyahIndex + 1} of {currentSurah.numberOfAyahs} • Recitation by {selectedReciter.name}
                    </p>
                </div>

                {/* Verse Display Card */}
                <div className="glass-panel w-full p-8 md:p-12 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-lg)] relative overflow-hidden flex flex-col gap-6 md:gap-8 min-h-[280px] md:min-h-[320px] justify-center transition-all duration-500 hover:border-accent/30">
                    
                    {/* Arabic Verse text with CSS entry transitions */}
                    <p 
                        key={`ar-${currentAyahIndex}`}
                        className="text-center md:text-right font-arabic text-2xl md:text-3xl lg:text-4xl leading-[1.8] md:leading-[2.0] text-main font-semibold select-none animate-in fade-in slide-in-from-top-4 duration-500"
                        dir="rtl"
                    >
                        {arabicAyah.text}
                    </p>
                    
                    {/* Minimalist Accent Divider */}
                    <div className="w-16 h-[2px] bg-accent/20 mx-auto rounded-full" />
                    
                    {/* English translation text with CSS entry transitions */}
                    <p 
                        key={`en-${currentAyahIndex}`}
                        className="text-center font-serif text-sm md:text-base lg:text-lg leading-relaxed text-muted leading-[1.6] md:leading-[1.7] px-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        {englishAyah.text}
                    </p>
                </div>

                {/* Ambient Status & Deactivation Controls */}
                <div className="flex flex-col items-center gap-4 mt-4">
                    {/* Small visualizer element */}
                    <div className="relative flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full bg-[var(--bg-main)] shadow-md flex items-center justify-center border border-[var(--border)] relative ${isPlaying && !isBuffering ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                            <Music className="w-4 h-4 text-accent/40" />
                            
                            {/* Orbiting visualizer elements */}
                            {isPlaying && !isBuffering && [0, 1].map(i => (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 bg-accent rounded-full blur-[2px]"
                                    style={{
                                        top: '50%',
                                        left: '50%',
                                        margin: '-4px',
                                        animation: `orbit-${i} 3s linear infinite`,
                                        animationDelay: `${i * 1.5}s`
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => actions.toggleRadioMode(false)}
                        className="text-xs font-semibold text-muted hover:text-accent transition-colors bg-[var(--bg-sidebar)] px-5 py-2.5 rounded-full border border-[var(--border)] hover:border-accent/30 shadow-md active:scale-95 transition-transform"
                    >
                        Deactivate Radio Mode
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes orbit-0 {
                    from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
                }
                @keyframes orbit-1 {
                    from { transform: rotate(180deg) translateX(32px) rotate(-180deg); }
                    to { transform: rotate(540deg) translateX(32px) rotate(-540deg); }
                }
            `}</style>
        </div>
    );
};
