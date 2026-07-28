import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Clock, Hourglass, SlidersHorizontal, X } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useQuran } from '../contexts/QuranContext';
import { formatTime, getRepeatText } from '../utils/formatTime';

const PlayerControls: React.FC = () => {
  const {
    isPlaying,
    progress,
    buffered,
    currentTime,
    duration,
    isBuffering,
    currentAyahIndex,
    verseRepeatLimit,
    isPausingBetweenVerses,
    pauseCountdown,
    isFullSurahAudio,
    sleepTimer,
    playbackRange,
    actions: { togglePlay, nextAyah, prevAyah, seek, setVerseRepeatLimit, setSleepTimer, setPlaybackRange }
  } = useAudio();

  const { currentSurah, selectedReciter, surahText, isRadioMode } = useQuran();

  // Calculate verse number for display
  const verseNumber = surahText?.arabic.ayahs[currentAyahIndex]?.numberInSurah;

  const handleRepeatToggle = () => {
    // Cycle limits: 1 -> 3 -> 5 -> -1 (infinite) -> 1
    if (verseRepeatLimit === 1) {
      setVerseRepeatLimit(3);
    } else if (verseRepeatLimit === 3) {
      setVerseRepeatLimit(5);
    } else if (verseRepeatLimit === 5) {
      setVerseRepeatLimit(-1);
    } else {
      setVerseRepeatLimit(1);
    }
  };

  const handleSleepTimerToggle = () => {
    // Cycle: null -> 15 -> 30 -> 45 -> 60 -> null
    if (sleepTimer === null) {
      setSleepTimer(15);
    } else if (sleepTimer <= 15) {
      setSleepTimer(30);
    } else if (sleepTimer <= 30) {
      setSleepTimer(45);
    } else if (sleepTimer <= 45) {
      setSleepTimer(60);
    } else {
      setSleepTimer(null);
    }
  };

  const isValidPlaybackRange = Boolean(
    playbackRange &&
    typeof playbackRange.startSurahNumber === 'number' &&
    typeof playbackRange.startAyahIndex === 'number' &&
    typeof playbackRange.endSurahNumber === 'number' &&
    typeof playbackRange.endAyahIndex === 'number'
  );

  const startSurahObj = isValidPlaybackRange ? surahs.find(s => s.number === playbackRange!.startSurahNumber) : null;
  const endSurahObj = isValidPlaybackRange ? surahs.find(s => s.number === playbackRange!.endSurahNumber) : null;

  return (
    <div className="glass-panel border-t relative z-30">
      {/* Active Range Indicator Banner */}
      {isValidPlaybackRange && playbackRange && (
        <div className="bg-accent/15 border-b border-accent/20 py-1 px-4 text-center flex items-center justify-center gap-2.5 animate-in fade-in duration-300">
          <span className="text-[11px] text-accent font-semibold flex items-center gap-1.5 truncate max-w-[85vw] sm:max-w-none">
            <SlidersHorizontal className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {playbackRange.startSurahNumber === playbackRange.endSurahNumber
                ? `Range: ${startSurahObj?.englishName || ''} (Ayah ${playbackRange.startAyahIndex + 1} – ${playbackRange.endAyahIndex + 1})`
                : `Range: ${startSurahObj?.englishName || ''} (v${playbackRange.startAyahIndex + 1}) → ${endSurahObj?.englishName || ''} (v${playbackRange.endAyahIndex + 1})`
              }
            </span>
          </span>
          <button
            onClick={() => setPlaybackRange(null)}
            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/20 hover:bg-accent/30 text-accent uppercase tracking-wider transition-colors flex items-center gap-1 flex-shrink-0"
            title="Clear range"
          >
            <X className="w-2.5 h-2.5" />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* Reflection Pause Indicator */}
      {isPausingBetweenVerses && (
        <div className="bg-accent/15 border-b border-accent/20 py-1 px-4 text-center animate-in fade-in duration-300">
          <p className="text-[11px] text-accent font-semibold flex items-center justify-center gap-1.5">
            <Hourglass className="w-3 h-3 animate-spin flex-shrink-0" />
            <span>Reflection Pause ({pauseCountdown}s remaining) • Tap control to skip</span>
          </p>
        </div>
      )}

      {/* Full-Width Dynamic Progress Bar */}
      <div className={`absolute top-0 left-0 w-full h-1 overflow-visible z-40 ${isRadioMode ? 'pointer-events-none' : 'group cursor-pointer hover:h-1.5 transition-[height] duration-300 ease-in-out'}`}>
        {/* Background / Track */}
        <div className="absolute inset-0 bg-[var(--accent-muted)] opacity-30 group-hover:opacity-50 transition-opacity" />

        {/* Buffered Layer */}
        <div
          className="absolute top-0 left-0 h-full bg-[var(--accent)] opacity-20 transition-[width] duration-500 ease-out"
          style={{ width: `${buffered}%` }}
        />

        {/* Active Progress Fill with Glow */}
        <div
          className="absolute top-0 left-0 h-full bg-accent transition-all duration-150 ease-linear shadow-[0_0_12px_var(--accent)]"
          style={{ width: `${progress}%` }}
        >
          {/* Subtle horizontal gradient for a "liquid" look */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Interaction Area (Invisible input but larger height) */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={isRadioMode}
          aria-label="Seek timeline"
          className="absolute -top-3 inset-x-0 w-full h-8 opacity-0 focus-visible:opacity-100 focus-visible:accent-[var(--accent)] cursor-pointer z-50 disabled:cursor-not-allowed"
        />

        {/* Premium Scrubber Thumb */}
        {!isRadioMode && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-2 h-4 w-4 pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-110"
            style={{ left: `${progress}%` }}
          >
            {/* External Halo */}
            <div className="absolute inset-0 bg-accent/30 rounded-full animate-ping opacity-50" />
            {/* Inner Solid Thumb */}
            <div className="absolute inset-0 bg-accent rounded-full border-2 border-[var(--bg-main)] shadow-xl" />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto w-full flex flex-col gap-1.5 sm:gap-2 p-3 sm:p-4 pb-5 md:pb-4">
        {/* Mobile Info */}
        <div className="md:hidden flex flex-col items-center text-center gap-0.5 max-w-full px-2">
          <div className="text-xs sm:text-sm font-semibold text-main truncate max-w-full">{currentSurah?.englishName}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider truncate max-w-full">
            {verseNumber ? `Verse ${verseNumber} • ` : ''}{selectedReciter?.name}
          </div>
        </div>

        {/* Time Indicators Row */}
        <div className="flex justify-between items-center px-1 text-[10px] font-mono text-muted mb-[-2px] sm:mb-[-4px]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-center relative w-full px-1 md:px-0">
          {/* Desktop Info */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2">
            <div className="text-sm font-semibold text-main">{currentSurah?.englishName}</div>
            <div className="text-xs text-muted">
              {verseNumber ? `Verse ${verseNumber} • ` : ''}{selectedReciter?.name}
            </div>
          </div>

          {/* Symmetrical 5-Button Center Cluster */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 mx-auto">
            {/* 1. Sleep Timer Button */}
            <button
              onClick={handleSleepTimerToggle}
              className={`p-2.5 sm:p-3 md:p-2 transition-colors relative active:scale-95 transition-transform flex-shrink-0 ${
                sleepTimer 
                  ? 'text-accent font-bold' 
                  : 'text-muted hover:text-accent'
              }`}
              aria-label="Toggle sleep timer"
              title={sleepTimer ? `Sleep timer: ${sleepTimer} mins remaining` : 'Set sleep timer'}
            >
              <Clock className="w-5 h-5" />
              {sleepTimer && (
                <span className="absolute -top-1 -right-1 text-[8px] font-mono bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center border border-[var(--bg-main)] shadow-sm">
                  {sleepTimer}
                </span>
              )}
            </button>

            {/* 2. Previous Ayah Button */}
            <button
              onClick={prevAyah}
              disabled={isRadioMode}
              className={`p-2.5 sm:p-3 md:p-2 text-muted hover:text-accent transition-colors active:scale-95 transition-transform flex-shrink-0 ${isRadioMode ? 'opacity-20 cursor-not-allowed pointer-events-none' : ''}`}
              aria-label="Previous Verse"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            {/* 3. Play / Pause Button (Center) */}
            <button
              onClick={togglePlay}
              aria-label={isBuffering ? 'Loading audio' : isPlaying ? 'Pause playback' : 'Play playback'}
              className="w-13 h-13 sm:w-14 sm:h-14 bg-accent hover:bg-accent/90 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-accent/30 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main)] transition-all duration-300 flex-shrink-0"
            >
              {isBuffering ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 ml-0.5 fill-current" />
              )}
            </button>

            {/* 4. Next Ayah Button */}
            <button
              onClick={nextAyah}
              disabled={isRadioMode}
              className={`p-2.5 sm:p-3 md:p-2 text-muted hover:text-accent transition-colors active:scale-95 transition-transform flex-shrink-0 ${isRadioMode ? 'opacity-20 cursor-not-allowed pointer-events-none' : ''}`}
              aria-label="Next Verse"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            {/* 5. Repeat / Loop Button */}
            <button
              onClick={handleRepeatToggle}
              disabled={isFullSurahAudio || isRadioMode}
              className={`p-2.5 sm:p-3 md:p-2 transition-colors relative active:scale-95 transition-transform flex-shrink-0 ${
                isFullSurahAudio || isRadioMode
                  ? 'opacity-20 cursor-not-allowed text-muted' 
                  : verseRepeatLimit > 1 || verseRepeatLimit === -1 
                    ? 'text-accent font-bold' 
                    : 'text-muted hover:text-accent'
              }`}
              aria-label="Toggle verse repeat limit"
              title={
                isFullSurahAudio 
                  ? 'Repeat mode not available for full surah audio' 
                  : isRadioMode
                    ? 'Repeat mode not available in radio mode'
                    : `Verse repeat limit: ${getRepeatText(verseRepeatLimit)}`
              }
            >
              <Repeat className="w-5 h-5" />
              {verseRepeatLimit !== 1 && !isFullSurahAudio && !isRadioMode && (
                <span className="absolute -top-1 -right-1 text-[8px] font-mono bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center border border-[var(--bg-main)] shadow-sm">
                  {verseRepeatLimit === -1 ? '∞' : `${verseRepeatLimit}`}
                </span>
              )}
            </button>
          </div>

          {/* Desktop Volume Indicator */}
          <div className="hidden md:flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2 text-muted opacity-50">
            <Volume2 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
