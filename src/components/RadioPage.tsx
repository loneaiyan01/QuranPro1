import React, { useEffect, useState } from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { Radio, Music, Play, Pause, Clock } from 'lucide-react';

export const RadioPage: React.FC = () => {
    const { currentSurah, selectedReciter, surahText, actions, isRadioMode } = useQuran();
    const { isPlaying, isBuffering, currentAyahIndex, sleepTimer, actions: audioActions } = useAudio();
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

    const englishAyah = surahText.english.ayahs[currentAyahIndex] || surahText.english.ayahs[0];

    const handleSleepTimerToggle = () => {
        if (sleepTimer === null) {
            audioActions.setSleepTimer(15);
        } else if (sleepTimer <= 15) {
            audioActions.setSleepTimer(30);
        } else if (sleepTimer <= 30) {
            audioActions.setSleepTimer(45);
        } else if (sleepTimer <= 45) {
            audioActions.setSleepTimer(60);
        } else {
            audioActions.setSleepTimer(null);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-between relative overflow-hidden bg-gradient-to-b from-transparent to-accent/5 p-6 pt-20 pb-8 text-center min-h-0">

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
            <div className="z-10 w-full max-w-2xl flex-1 flex flex-col justify-between items-center gap-4 animate-in fade-in zoom-in duration-500 min-h-0">
                
                {/* Header Information */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                        <Radio className="w-3.5 h-3.5 text-accent animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Quran Live Radio</span>
                    </div>
                    
                    <h1 className="text-xl md:text-2xl font-serif font-bold text-main mt-1 tracking-tight">
                        {currentSurah.englishName}
                    </h1>
                    
                    <p className="text-[11px] text-muted tracking-wide">
                        Verse {currentAyahIndex + 1} of {currentSurah.numberOfAyahs} • Recitation by {selectedReciter.name}
                    </p>
                </div>

                {/* Verse Display Card */}
                <div className="glass-panel w-full flex-1 min-h-[140px] max-h-[380px] p-6 md:p-10 rounded-3xl border border-[var(--border)] shadow-[var(--shadow-lg)] relative overflow-hidden flex flex-col justify-center transition-all duration-500 hover:border-accent/30 my-2">
                    {/* Scrollable container for text to prevent bleeding on small viewports */}
                    <div className="overflow-y-auto max-h-full custom-scrollbar pr-1">
                        {/* English translation text with CSS entry transitions */}
                        <p 
                            key={`en-${currentAyahIndex}`}
                            className="text-center font-serif text-sm sm:text-base md:text-lg leading-relaxed text-main px-1 animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            {englishAyah.text}
                        </p>
                    </div>
                </div>

                {/* Dedicated Radio Audio Player Controls */}
                <div className="flex flex-col items-center gap-4 mt-2 w-full max-w-xs flex-shrink-0">
                    <div className="flex items-center justify-center gap-6">
                        {/* Sleep Timer Preset Controller */}
                        <button
                            onClick={handleSleepTimerToggle}
                            className={`p-3 rounded-full transition-all relative active:scale-95 bg-[var(--bg-sidebar)] border border-[var(--border)] hover:border-accent/30 shadow-md ${
                                sleepTimer 
                                    ? 'text-accent font-bold border-accent/30 shadow-accent/5' 
                                    : 'text-muted hover:text-accent'
                            }`}
                            aria-label="Toggle sleep timer"
                            title={sleepTimer ? `Sleep timer: ${sleepTimer} mins remaining` : 'Set sleep timer'}
                        >
                            <Clock className="w-5 h-5" />
                            {sleepTimer && (
                                <span className="absolute -top-1 -right-1 text-[8px] font-mono bg-accent text-white rounded-full w-4.5 h-4.5 flex items-center justify-center border border-[var(--bg-main)] shadow-sm">
                                    {sleepTimer}
                                </span>
                            )}
                        </button>

                        {/* Large Play/Pause Toggle */}
                        <button
                            onClick={audioActions.togglePlay}
                            aria-label={isBuffering ? 'Loading audio' : isPlaying ? 'Pause playback' : 'Play playback'}
                            className="w-14 h-14 bg-accent hover:bg-accent/90 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-accent/30 hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            {isBuffering ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 ml-0.5 fill-current" />
                            )}
                        </button>

                        {/* Ambient Visualizer Spinner */}
                        <div className="relative flex items-center justify-center">
                            <div className={`w-11 h-11 rounded-full bg-[var(--bg-main)] shadow-md flex items-center justify-center border border-[var(--border)] relative ${isPlaying && !isBuffering ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
                                <Music className="w-4.5 h-4.5 text-accent/40" />
                                
                                {isPlaying && !isBuffering && [0, 1].map(i => (
                                    <div
                                        key={i}
                                        className="absolute w-1.5 h-1.5 bg-accent rounded-full blur-[1px]"
                                        style={{
                                            top: '50%',
                                            left: '50%',
                                            margin: '-3px',
                                            animation: `orbit-${i} 3.5s linear infinite`,
                                            animationDelay: `${i * 1.75}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Return to Verse Player */}
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
                    from { transform: rotate(0deg) translateX(26px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(26px) rotate(-360deg); }
                }
                @keyframes orbit-1 {
                    from { transform: rotate(180deg) translateX(28px) rotate(-180deg); }
                    to { transform: rotate(540deg) translateX(28px) rotate(-540deg); }
                }
            `}</style>
        </div>
    );
};
