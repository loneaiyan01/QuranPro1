import React, { useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  onSeek: (value: number) => void;
  currentTime: number;
  duration: number;
  surahName?: string;
  reciterName?: string;
  verseNumber?: number;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  progress,
  onSeek,
  currentTime,
  duration,
  surahName,
  reciterName,
  verseNumber
}) => {
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/90 dark:bg-emerald-900/95 backdrop-blur-md border-t border-gray-100 dark:border-emerald-800 p-4 pb-6 md:pb-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-4">
        
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-3 text-xs text-gray-400 font-mono">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 relative h-1.5 bg-gray-200 dark:bg-emerald-800 rounded-full cursor-pointer group">
            <div 
              className="absolute top-0 left-0 h-full bg-emerald-600 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={progress} 
              onChange={(e) => onSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {/* Hover thumb effect */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-emerald-600 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progress}%` }}
            />
          </div>
          <span className="w-10">{formatTime(duration)}</span>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between md:justify-center relative">
            
          {/* Info (Hidden on mobile mostly, simplified) */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2">
             <div className="text-sm font-medium text-emerald-900 dark:text-emerald-100">{surahName}</div>
             <div className="text-xs text-emerald-600/70 dark:text-emerald-400">Verse {verseNumber} • {reciterName}</div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-6 mx-auto">
            <button 
              onClick={onPrev}
              className="p-2 text-gray-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors"
              aria-label="Previous Verse"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button 
              onClick={onPlayPause}
              className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
            </button>

            <button 
              onClick={onNext}
              className="p-2 text-gray-500 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors"
              aria-label="Next Verse"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Volume / Extra (Placeholder for now) */}
          <div className="hidden md:flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
             <Volume2 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
