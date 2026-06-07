import React from 'react';
import { Volume2, Settings } from 'lucide-react';
import { InstrumentType } from '../types';

interface SidebarProps {
  activeInstrument: InstrumentType;
  onChangeInstrument: (inst: InstrumentType) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  activeInstrument,
  onChangeInstrument,
  volume,
  onVolumeChange,
  onOpenSettings,
}: SidebarProps) {
  const instruments = [
    {
      id: 'piano' as InstrumentType,
      label: 'PIANO',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M7 3v12M11 3v12M15 3v12M19 3v12M3 15h18" />
          <path d="M9 15h.01M13 15h.01M17 15h.01" />
        </svg>
      )
    },
    {
      id: 'dan_tranh' as InstrumentType,
      label: 'ĐÀN TRANH',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Zither string lines */}
          <path d="M4 6h16M4 9h16M4 12h16M4 15h16M4 18h16" />
          {/* Bridges (Nhạn Đàn) */}
          <path d="M6 5l2 3 M10 8l2 3 M14 11l2 3 M8 14l2 3" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'dan_bau' as InstrumentType,
      label: 'ĐÀN BẦU',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Single string with gourd bend */}
          <path d="M12 2v20" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 4c-2 0-3 2-3 4s1 2 3 2c3 0-2-8-2-8" fill="currentColor" opacity="0.3" />
          <path d="M8 2h8" />
        </svg>
      )
    },
    {
      id: 'sao_truc' as InstrumentType,
      label: 'SÁO TRÚC',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Flute holes */}
          <rect x="2" y="10" width="20" height="4" rx="2" />
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="10" cy="12" r="1.5" fill="currentColor" />
          <circle cx="13" cy="12" r="1.5" fill="currentColor" />
          <circle cx="16" cy="12" r="1.5" fill="currentColor" />
          <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'guitar' as InstrumentType,
      label: 'GUITAR',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13M9 10h12M9 14h12" />
          <circle cx="6" cy="18" r="3" />
        </svg>
      )
    },
    {
      id: 'violin' as InstrumentType,
      label: 'VIOLIN',
      icon: (
        <svg className={`w-6 h-6`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C9 4 9 7 9 9s1 3 3 5 3-3 3-5-1-5-3-7z" style={{ transformOrigin: 'center' }} />
          <path d="M11 14v6a1 1 0 001 1h0a1 1 0 001-1v-6" />
        </svg>
      )
    },
  ];

  return (
    <div id="sidebar" className="w-[260px] h-full flex flex-col justify-between border-r border-[#1a2638] bg-[#0b121f] text-[#8e9bb3] p-6 shrink-0 z-10 select-none">
      <div className="flex flex-col gap-8 pt-14">
        {/* Instruments selection list */}
        <div className="flex flex-col gap-3">
          {instruments.map((inst) => {
            const isActive = activeInstrument === inst.id;
            return (
              <button
                key={inst.id}
                id={`btn-instrument-${inst.id}`}
                onClick={() => onChangeInstrument(inst.id)}
                className={`group flex items-center justify-start gap-4 p-4 rounded-xl border text-left cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-[#151f30] border-[#ffad4d] text-white shadow-xl shadow-[#ffad4d]/5'
                    : 'bg-[#0f1826]/40 border-[#152033]/60 hover:bg-[#131d2d]/60 hover:border-[#213149] hover:text-[#d3dfef]'
                }`}
              >
                <div
                  className={`transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-[#ffad4d]' : 'text-[#4e5b72] group-hover:text-[#8e9bb3]'
                  }`}
                >
                  {inst.icon}
                </div>
                <span className={`text-xs font-bold tracking-widest font-sans ${isActive ? 'text-white' : 'text-[#62728c] group-hover:text-[#a0b0cc]'}`}>
                  {inst.label}
                </span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 bg-[#ffad4d] rounded-full shadow-lg shadow-[#ffad4d]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Settings Button */}
        <button
          id="btn-sidebar-settings"
          onClick={onOpenSettings}
          className="group flex items-center gap-4 py-3 px-4 rounded-xl border border-transparent hover:border-[#1e2e46]/60 hover:bg-[#121c2c]/40 text-[#62728c] hover:text-white transition-all duration-300 cursor-pointer"
        >
          <Settings className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
          <span className="text-xs font-bold tracking-wider">SETTINGS</span>
        </button>

        {/* Volume controls */}
        <div className="flex flex-col gap-3 px-4">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#49576e]">
            <span className="font-sans">VOLUME</span>
            <span className="font-mono text-[#8e9bb3]">{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 shrink-0 text-[#49576e]" />
            <div className="relative w-full h-1.5 bg-[#141f31] rounded-full group cursor-pointer">
              <input
                id="volume-slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className="h-full bg-gradient-to-r from-[#e09133] to-[#ffad4d] rounded-full relative"
                style={{ width: `${volume * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border border-[#bf7621] rounded-full scale-0 group-hover:scale-100 transition-transform duration-200 shadow-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
