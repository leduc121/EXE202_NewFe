import React from 'react';
import { UploadCloud } from 'lucide-react';
import { Song } from '../types';

interface HeaderProps {
  activeSong: Song;
  onUploadClick: () => void;
}

export default function Header({
  activeSong,
  onUploadClick,
}: HeaderProps) {
  return (
    <div id="app-header" className="w-full flex-col md:flex-row flex justify-between items-start md:items-center gap-3 py-2.5 pb-3 border-b border-[#141d2c] select-none shrink-0">
      
      {/* Title block */}
      <div className="flex min-w-0 max-w-full flex-1 flex-col gap-1 md:gap-1.5">
        <div id="song-title-group" className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="min-w-0 max-w-full truncate text-xl md:text-2xl font-bold font-sans tracking-tight text-white mb-0">
            {activeSong.title}
          </h1>
          {activeSong.isAiGenerated && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ffad4d]/10 border border-[#ffad4d]/30 text-[#ffad4d] text-[10px] font-extrabold uppercase tracking-widest leading-none">
              <span>AI Generated</span>
            </div>
          )}
        </div>

        {/* Info labels */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#52637f] font-sans">
          <div className="flex items-center gap-1">
            <span className="text-[#3b4b61] font-semibold">Instrument:</span>
            <span className="text-[#99abc5] font-semibold">{activeSong.instrument}</span>
          </div>
          <span className="w-1.5 h-1.5 bg-[#141e2e] rounded-full"></span>
          <div className="flex items-center gap-1">
            <span className="text-[#3b4b61] font-semibold">Key:</span>
            <span className="text-[#99abc5] font-semibold">{activeSong.key}</span>
          </div>
          <span className="w-1.5 h-1.5 bg-[#141e2e] rounded-full"></span>
          <div className="flex items-center gap-1">
            <span className="text-[#3b4b61] font-semibold">Tempo:</span>
            <span className="text-[#99abc5] font-semibold">{activeSong.tempo} BPM</span>
          </div>
          <span className="w-1.5 h-1.5 bg-[#141e2e] rounded-full"></span>
          <div className="flex items-center gap-1">
            <span className="text-[#3b4b61] font-semibold">Time:</span>
            <span className="text-[#99abc5] font-semibold">{activeSong.timeSignature}</span>
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 w-full md:w-auto mt-1 md:mt-0">
        {/* Upload/Transcribe focus trigger */}
        <button
          onClick={onUploadClick}
          id="btn-header-ai-transcribe"
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-[#de2c7d] to-[#4c27de]/0 border border-[#de2c7d]/35 text-white text-xs font-bold hover:scale-105 hover:shadow-[0_0_15px_rgba(222,44,125,0.3)] transition-all duration-300 outline-none cursor-pointer pr-5 shadow-lg shadow-[#000]/20"
          style={{ background: 'linear-gradient(135deg, #e37e19 0%, #bd4b1e 100%)' }}
        >
          <UploadCloud className="w-4 h-4 text-white" />
          <span>AI Audio Transcribe</span>
        </button>
      </div>

    </div>
  );
}
