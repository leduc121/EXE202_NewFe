import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Music4, RotateCcw, Volume2, Eye } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isLoop: boolean;
  onToggleLoop: () => void;
  isMetronome: boolean;
  onToggleMetronome: () => void;
  isVisualizer: boolean;
  onToggleVisualizer: () => void;
}

// Formats seconds into MM:SS format
const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onNextSong,
  onPrevSong,
  currentTime,
  duration,
  onSeek,
  isLoop,
  onToggleLoop,
  isMetronome,
  onToggleMetronome,
  isVisualizer,
  onToggleVisualizer,
}: PlayerControlsProps) {
  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div id="player-controls" className="w-full h-18 bg-[#0c121e]/90 border border-[#141b27] rounded-2xl flex items-center justify-between px-6 py-2 shadow-2xl relative select-none shrink-0 backdrop-blur-md">
      
      {/* Left section: Playback triggers & counters */}
      <div className="flex items-center gap-5">
        <button
          onClick={onPrevSong}
          id="btn-player-prev"
          className="p-2 rounded-lg text-[#55657f] hover:text-white hover:bg-[#141e2e]/40 transition-colors duration-200 cursor-pointer"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        {/* Circular Play/Pause trigger */}
        <button
          onClick={onPlayPause}
          id="btn-player-toggle"
          className="w-10 h-10 rounded-full bg-[#152134] text-[#ffad4d] hover:bg-[#ffad4d] hover:text-black flex items-center justify-center transition-all duration-300 shadow-lg shadow-[#000]/40 group cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current stroke-none" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5 stroke-none transition-transform duration-200 group-hover:scale-110" />
          )}
        </button>

        <button
          onClick={onNextSong}
          id="btn-player-next"
          className="p-2 rounded-lg text-[#55657f] hover:text-white hover:bg-[#141e2e]/40 transition-colors duration-200 cursor-pointer"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>

        {/* Dynamic Monospace Timer layout values */}
        <div className="text-xs font-mono font-bold text-[#8c9cb6] tracking-widest pl-1">
          <span>{formatTime(currentTime)}</span>
          <span className="opacity-45 px-1.5">/</span>
          <span className="opacity-60">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Middle section: Seek drag progress bar */}
      <div className="flex-1 max-w-[45%] mx-6 relative flex items-center">
        <div className="relative w-full h-1 bg-[#101826] rounded-full group cursor-pointer">
          <input
            id="player-seek"
            type="range"
            min="0"
            max={duration || 100}
            step="0.05"
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          {/* Active timeline bar track fill */}
          <div
            className="h-full bg-gradient-to-r from-[#dca06b] to-[#ffad4d] rounded-full relative"
            style={{ width: `${percent}%` }}
          >
            {/* Glowing amber node cap head */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#ffad4d] rounded-full scale-0 group-hover:scale-100 transition-transform duration-200 shadow-[0_0_12px_rgba(255,173,77,0.8)] border border-white"></div>
          </div>
        </div>
      </div>

      {/* Right section: Metronome, Loop, Visualizer toggles */}
      <div className="flex items-center gap-3">
        {/* Metronome */}
        <button
          onClick={onToggleMetronome}
          id="btn-player-metronome"
          className={`flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
            isMetronome
              ? 'bg-[#152134] border-[#ffad4d] text-[#ffad4d] shadow-[0_0_12px_rgba(255,173,77,0.1)]'
              : 'border-[#1b2b41] text-[#5c6c85] hover:text-[#a0b0cc] hover:bg-[#101927]'
          }`}
        >
          <Music4 className="w-4 h-4" />
          <span>Metronome</span>
          {isMetronome && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffad4d] border border-white animate-pulse"></span>
          )}
        </button>

        {/* Loop */}
        <button
          onClick={onToggleLoop}
          id="btn-player-loop"
          className={`flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
            isLoop
              ? 'bg-[#152134] border-[#ffad4d] text-[#ffad4d]'
              : 'border-[#1b2b41] text-[#5c6c85] hover:text-[#a0b0cc] hover:bg-[#101927]'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Loop</span>
        </button>

        {/* Visualizer */}
        <button
          onClick={onToggleVisualizer}
          id="btn-player-visualizer"
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer ${
            isVisualizer
              ? 'bg-[#ffe7ce]/10 border-[#ffbb73]/40 text-[#ffb45a] shadow-[0_0_12px_rgba(255,173,77,0.15)]'
              : 'border-[#1b2b41] text-[#5c6c85] hover:text-[#a0b0cc] hover:bg-[#101927]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Visualizer</span>
        </button>
      </div>

    </div>
  );
}
