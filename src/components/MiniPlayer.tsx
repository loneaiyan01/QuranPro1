import React from 'react';
import { useQuran } from '../contexts/QuranContext';
import { useAudio } from '../contexts/AudioContext';
import { Play, Pause, Music, ChevronRight } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
    const { currentSurah, selectedReciter, isRadioMode, actions: quranActions } = useQuran();
    const { isPlaying, isBuffering, progress, actions: audioActions } = useAudio();

    if (!currentSurah) return null;

    const handleContainerClick = () => {
        quranActions.setCurrentPage(isRadioMode ? 'radio' : 'player');
    };

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent navigation to main player page
        audioActions.togglePlay();
    };

    return (
        <div 
            onClick={handleContainerClick}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 z-40 glass-panel hover:bg-[var(--bg-card-active)] hover:border-accent/30 rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden cursor-pointer transition-colors duration-150 flex flex-col animate-in slide-in-from-bottom-6 duration-300"
        >
            {/* Top thin progress bar (GPU scaleX, no reflow) */}
            <div className="w-full bg-accent-muted h-1 relative overflow-hidden">
                <div 
                    className="bg-accent h-full w-full shadow-[0_0_8px_var(--accent)] origin-left transition-transform duration-150"
                    style={{ transform: `scaleX(${progress / 100})`, transitionTimingFunction: 'linear' }}
                />
            </div>

            <div className="flex items-center justify-between p-3 gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-accent-muted text-accent flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                        <h4 className="text-xs font-bold text-main truncate leading-tight">
                            {currentSurah.englishName}
                        </h4>
                        <p className="text-[10px] text-muted truncate mt-0.5">
                            {selectedReciter?.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePlayPause}
                        className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center btn-press hit-area-44 transition-transform duration-150 shadow-md shadow-accent/15 flex-shrink-0"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isBuffering ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                    </button>
                    <ChevronRight className="w-4 h-4 text-muted animate-pulse" />
                </div>
            </div>
        </div>
    );
};
