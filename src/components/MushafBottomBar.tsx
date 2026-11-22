import React, { useState } from 'react';
import { PageAyah, Surah, Reciter } from '../types';
import { formatTime, getRepeatText } from '../utils/formatTime';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Clock,
  ChevronUp,
  ChevronDown,
  Layers,
  Copy,
  Check,
  BookOpen,
  Volume2
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface MushafBottomBarProps {
  currentSurah: Surah | null;
  activeAyah: PageAyah | null;
  activeTranslation: string | null;
  selectedReciter: Reciter | null;
  isPlaying: boolean;
  isBuffering: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNextAyah: () => void;
  onPrevAyah: () => void;
  onSeek: (percent: number) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  verseRepeatLimit: number;
  onRepeatToggle: () => void;
  sleepTimer: number | null;
  onSleepTimerToggle: () => void;
  isStandMode: boolean;
  onToggleStandMode: () => void;
  viewMode: 'mushaf' | 'cards';
  onToggleViewMode: () => void;
  isMobile: boolean;
}

export const MushafBottomBar: React.FC<MushafBottomBarProps> = ({
  currentSurah,
  activeAyah,
  activeTranslation,
  selectedReciter,
  isPlaying,
  isBuffering,
  progress,
  currentTime,
  duration,
  onTogglePlay,
  onNextAyah,
  onPrevAyah,
  onSeek,
  speed,
  onSpeedChange,
  verseRepeatLimit,
  onRepeatToggle,
  sleepTimer,
  onSleepTimerToggle,
  isStandMode,
  onToggleStandMode,
  viewMode,
  onToggleViewMode,
  isMobile
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { showToast } = useToast();

  const handleCopyTranslation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeTranslation || !activeAyah) return;
    const textToCopy = `"${activeTranslation}"\n\n— ${activeAyah.surah.englishName} [${activeAyah.surah.number}:${activeAyah.numberInSurah}]`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      showToast(`Copied translation of Ayah ${activeAyah.numberInSurah}`, { type: 'success' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast('Unable to copy translation', { type: 'info' });
    }
  };

  const handleCycleSpeed = () => {
    if (speed === 1.0) onSpeedChange(1.25);
    else if (speed === 1.25) onSpeedChange(1.5);
    else if (speed === 1.5) onSpeedChange(0.75);
    else onSpeedChange(1.0);
  };

  return (
    <footer className="fixed bottom-0 inset-x-0 bg-[var(--bg-sidebar)]/95 backdrop-blur-2xl border-t border-[var(--border)] z-40 shadow-2xl transition-all duration-200">
      {/* Liquid Full-Width Audio Scrubber */}
      <div className="relative w-full h-1 sm:h-1.5 hover:h-2 group transition-[height] duration-150 cursor-pointer">
        <div className="absolute inset-0 bg-white/[0.08]" />
        <div
          className="absolute top-0 left-0 h-full bg-accent origin-left transition-transform duration-150 shadow-[0_0_10px_var(--accent)]"
          style={{
            transform: `scaleX(${progress / 100})`,
            transitionTimingFunction: 'linear'
          }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="absolute -top-3.5 inset-x-0 w-full h-8 opacity-0 cursor-pointer hit-area-44"
          aria-label="Audio scrubber"
        />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col justify-between">
        
        {/* ===================================================================
            SECTION 1: TRANSLATION DISPLAY SECTION (The User Request)
           =================================================================== */}
        {isExpanded && activeTranslation && (
          <div className="pb-2 mb-1.5 border-b border-white/[0.06] flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="min-w-0 flex-1">
              {/* Header Badges */}
              <div className="flex items-center gap-2 mb-1 text-[11px] font-medium text-muted">
                <span className="px-2 py-0.5 rounded-md bg-accent/15 text-accent font-semibold text-[10px]">
                  {activeAyah ? `${activeAyah.surah.englishName} [${activeAyah.surah.number}:${activeAyah.numberInSurah}]` : 'Translation'}
                </span>
                {activeAyah?.page && (
                  <span className="text-[10px] text-muted/70">
                    Page {activeAyah.page} • Juz {activeAyah.juz}
                  </span>
                )}
              </div>

              {/* Translation Text (Hilali-Khan Clear English) */}
              <p
                className="text-xs sm:text-sm font-sans text-white/95 leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-default select-text"
                title={activeTranslation}
              >
                "{activeTranslation}"
              </p>
            </div>

            {/* Quick Actions for Translation */}
            <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
              <button
                onClick={handleCopyTranslation}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors hit-area-40"
                title="Copy Ayah translation"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors hit-area-40"
                title="Collapse translation bar"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION 2: CORE PLAYBACK CONTROLS & ADDON TOGGLES
           =================================================================== */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-12">
          
          {/* Left: Now Playing Metadata & Expand Translation Toggle */}
          <div className="flex items-center gap-2 min-w-0 max-w-[140px] sm:max-w-xs">
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="p-1 text-accent hover:text-white rounded-md hit-area-40 flex items-center gap-1 text-[11px] font-semibold bg-accent/15 px-2 py-1"
                title="Expand Translation"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Translation</span>
              </button>
            )}

            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-white truncate">
                {activeAyah ? activeAyah.surah.englishName : (currentSurah?.englishName || 'HearQuran')}
              </div>
              <div className="text-[10px] sm:text-xs text-muted truncate tabular-nums">
                {activeAyah ? `Ayah ${activeAyah.numberInSurah} • ` : ''}
                {selectedReciter?.englishName || 'Recitation'}
              </div>
            </div>
          </div>

          {/* Center: Playback Core Buttons */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Previous Ayah */}
              <button
                onClick={onPrevAyah}
                className="p-1.5 sm:p-2 text-muted hover:text-white transition-colors btn-press hit-area-44"
                title="Previous Ayah (←)"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Play / Pause Morph Button */}
              <button
                onClick={onTogglePlay}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/30 hover:scale-105 active:scale-95 transition-transform flex-shrink-0 hit-area-44 btn-press relative"
                title={isPlaying ? "Pause (Space)" : "Play (Space)"}
              >
                {isBuffering ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Ayah */}
              <button
                onClick={onNextAyah}
                className="p-1.5 sm:p-2 text-muted hover:text-white transition-colors btn-press hit-area-44"
                title="Next Ayah (→)"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Timers */}
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono tabular-nums text-muted/80">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Addons & Utility Toggles (Wooden Stand Addon, Speed, Repeat) */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Wooden Stand Mode Addon Toggle (Optional!) */}
            <button
              onClick={onToggleStandMode}
              className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors btn-press hit-area-40 border ${
                isStandMode
                  ? 'bg-amber-950/60 text-amber-300 border-amber-600/40 shadow-xs'
                  : 'bg-white/[0.04] text-muted hover:text-white border-white/[0.08]'
              }`}
              title={isStandMode ? "Wooden Stand is ON (Click to switch to Clean Flat mode)" : "Turn ON Wooden Stand Mode"}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{isStandMode ? 'Stand: ON' : 'Stand'}</span>
            </button>

            {/* View Mode Toggle: Mushaf Page vs Cards */}
            <button
              onClick={onToggleViewMode}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors btn-press hit-area-40 border ${
                viewMode === 'mushaf'
                  ? 'bg-accent/20 border-accent/40 text-accent font-bold'
                  : 'bg-white/[0.04] text-muted hover:text-white border-white/[0.08]'
              }`}
              title={viewMode === 'mushaf' ? "Switch to Verse Cards List View" : "Switch to Madani Mushaf Page View"}
            >
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span className="hidden md:inline">{viewMode === 'mushaf' ? 'Mushaf' : 'Cards'}</span>
            </button>

            {/* Playback Speed Pill */}
            <button
              onClick={handleCycleSpeed}
              className="px-2 py-1 rounded-xl text-[11px] font-mono tabular-nums font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-muted hover:text-white border border-white/[0.08] btn-press hit-area-40"
              title="Change Playback Speed"
            >
              {speed}x
            </button>

            {/* Repeat Pill */}
            <button
              onClick={onRepeatToggle}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors btn-press hit-area-40 ${
                verseRepeatLimit !== 1
                  ? 'text-accent font-bold bg-accent/15'
                  : 'text-muted hover:text-white hover:bg-white/[0.05]'
              }`}
              title={`Repeat: ${getRepeatText(verseRepeatLimit)}`}
            >
              <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {verseRepeatLimit !== 1 && (
                <span className="text-[10px] font-mono tabular-nums hidden sm:inline">
                  {verseRepeatLimit === -1 ? '∞' : `${verseRepeatLimit}x`}
                </span>
              )}
            </button>

            {/* Sleep Timer Pill */}
            <button
              onClick={onSleepTimerToggle}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors btn-press hit-area-40 ${
                sleepTimer !== null
                  ? 'text-accent font-bold bg-accent/15'
                  : 'text-muted hover:text-white hover:bg-white/[0.05]'
              }`}
              title={sleepTimer ? `Sleep Timer: ${sleepTimer}m` : 'Set Sleep Timer'}
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {sleepTimer !== null && (
                <span className="text-[10px] font-mono tabular-nums hidden sm:inline">{sleepTimer}m</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};
