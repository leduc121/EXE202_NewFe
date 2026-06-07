import React, { useState } from 'react';
import { PITCH_FREQ } from '../songsData';
import { audioEngine } from '../utils/AudioEngine';

interface DanTranhSimulatorProps {
  activePitches: string[];
  onKeyTrigger?: (pitch: string, frequency: number) => void;
}

interface ZitherString {
  index: number;
  pitch: string;
  vietName: string;
  frequency: number;
  label: string;
}

const TRANH_STRINGS: ZitherString[] = [
  { index: 0, pitch: 'A3', vietName: 'Xự Trầm', frequency: PITCH_FREQ['A3'], label: 'Hò' },
  { index: 1, pitch: 'C4', vietName: 'Hò', frequency: PITCH_FREQ['C4'], label: 'Hò' },
  { index: 2, pitch: 'D4', vietName: 'Xự', frequency: PITCH_FREQ['D4'], label: 'Xự' },
  { index: 3, pitch: 'F4', vietName: 'Xang', frequency: PITCH_FREQ['F4'], label: 'Xang' },
  { index: 4, pitch: 'G4', vietName: 'Xê', frequency: PITCH_FREQ['G4'], label: 'Xê' },
  { index: 5, pitch: 'A4', vietName: 'Cống', frequency: PITCH_FREQ['A4'], label: 'Cống' },
  { index: 6, pitch: 'C5', vietName: 'Líu', frequency: PITCH_FREQ['C5'], label: 'Líu' },
  { index: 7, pitch: 'D5', vietName: 'U', frequency: PITCH_FREQ['D5'], label: 'U' },
  { index: 8, pitch: 'F5', vietName: 'Xang Cao', frequency: PITCH_FREQ['F5'], label: 'Xang' },
  { index: 9, pitch: 'G5', vietName: 'Xê Cao', frequency: PITCH_FREQ['G5'], label: 'Xê' },
  { index: 10, pitch: 'A5', vietName: 'Cống Cao', frequency: PITCH_FREQ['A5'], label: 'Cống' },
  { index: 11, pitch: 'C6', vietName: 'Líu Cao', frequency: PITCH_FREQ['C6'], label: 'Líu' },
];

export default function DanTranhSimulator({ activePitches, onKeyTrigger }: DanTranhSimulatorProps) {
  const [vibratingStrings, setVibratingStrings] = useState<number[]>([]);

  const handlePluck = (str: ZitherString) => {
    // Play sound in audioEngine under zither profile
    audioEngine.playNote(str.pitch, str.frequency, 'dan_tranh', 1.2);
    setVibratingStrings(prev => [...prev, str.index]);
    setTimeout(() => {
      setVibratingStrings(prev => prev.filter(idx => idx !== str.index));
    }, 1000);

    if (onKeyTrigger) {
      onKeyTrigger(str.pitch, str.frequency);
    }
  };

  return (
    <div id="dan-tranh-simulator" className="w-full flex flex-col pt-3 pb-5 bg-gradient-to-b from-[#0b1019] to-[#04070a] border border-[#162132] rounded-2xl p-6 shadow-2xl relative select-none">
      {/* Wooden frame styling */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#2a1304] via-[#482005] to-[#1a0c02] rounded-t-2xl border-b border-[#000] flex items-center justify-between px-8">
        <span className="text-[7.5px] tracking-[0.25em] text-[#dca06b] font-semibold opacity-70">VIETNAMESE 16-STRING ZITHER (ĐÀN TRANH)</span>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#fe5a5a]/20 rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-[#fe915a]/40 rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-[#ffba5a] rounded-full shadow-md shadow-[#ffba5a]"></span>
        </div>
      </div>

      <div className="w-full flex justify-between items-center mb-5 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-2.5 bg-[#ff9f2a] rounded"></span>
          <span className="text-xs font-bold text-[#adbcd7] uppercase tracking-wider">Đàn Tranh String Board</span>
        </div>
        <span className="text-[10px] text-[#4d5c75] font-mono border border-[#1a293f] px-1.5 py-0.5 rounded">Pluck strings to play</span>
      </div>

      {/* The Zither Core */}
      <div className="relative w-full h-[180px] bg-gradient-to-b from-[#0f1114] via-[#1c130c] to-[#0f1114] rounded-xl overflow-hidden shadow-2xl border border-[#2d1c0e] p-2 flex flex-col justify-between">
        {/* Bridge Curve Line SVG shadow */}
        <div className="absolute inset-x-0 inset-y-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%">
            <path d="M 50 150 Q 400 30 950 120" stroke="#ff8c00" strokeWidth="6" fill="none" />
          </svg>
        </div>

        {/* 12 Strings rendered as interactive columns */}
        <div className="relative w-full h-full flex flex-col justify-between items-stretch py-1">
          {TRANH_STRINGS.map((str) => {
            const isActive = activePitches.includes(str.pitch);
            const isVibrating = vibratingStrings.includes(str.index) || isActive;

            // Compute bridge offset - mimicking S curve arrangement
            // bridges go from high near the bridge (left) to low near center
            const bridgeXPercent = 15 + (str.index / TRANH_STRINGS.length) * 65;

            return (
              <div
                key={str.index}
                className="relative h-3 flex items-center group cursor-pointer"
                onClick={() => handlePluck(str)}
              >
                {/* Visual String Line */}
                <div
                  className={`absolute left-0 right-0 h-[1.5px] transition-all duration-300 ${
                    isVibrating
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_10px_#ff9d00,0-0_4px_#ffffff]'
                      : 'bg-gradient-to-r from-[#504030] via-[#ab9475] to-[#504030]\'}'
                  }`}
                  style={{
                    animation: isVibrating ? 'vibrate 0.1s linear infinite' : 'none',
                    boxShadow: isVibrating ? '0 0 8px 1.5px rgba(255,173,77,0.9)' : 'none',
                    transform: isVibrating ? 'translateY(-0.5px)' : 'none'
                  }}
                />

                {/* Aesthetic Inverted-V Bridges ("Nhạn Đàn") */}
                <div
                  className="absolute z-10 w-3 h-5 -translate-y-1 transition-all duration-300 cursor-pointer text-center flex flex-col items-center group-hover:scale-110"
                  style={{ left: `${bridgeXPercent}%` }}
                >
                  <svg width="12" height="15" viewBox="0 0 12 15" fill="none">
                    <path
                      d="M6 1 L11 14 L1 14 Z"
                      fill={isVibrating ? '#ff9f2a' : '#bf3413'}
                      stroke={isVibrating ? '#fff' : '#4d1406'}
                      strokeWidth="1"
                    />
                    <circle cx="6" cy="4" r="1.5" fill={isVibrating ? '#ffffff' : '#ffd066'} />
                  </svg>
                </div>

                {/* String Label Left (Sino-Viet Note labels) */}
                <div className="absolute left-4 z-20 flex items-center gap-2">
                  <span className={`text-[9px] font-sans font-extrabold ${isVibrating ? 'text-amber-400' : 'text-[#445268]'} uppercase tracking-tight w-8 text-right`}>
                    {str.vietName}
                  </span>
                  <span className={`text-[8.5px] font-mono px-1 rounded-sm bg-[#080d15] ${isVibrating ? 'text-white border border-[#bf7621]' : 'text-[#394a61] border border-transparent'}`}>
                    {str.pitch}
                  </span>
                </div>

                {/* Hover/Fingertip Action Indicator right */}
                <div className="absolute right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-[8px] bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded px-1 py-0.2">
                    PLUCK
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes vibrate {
          0% { transform: translateY(-0.8px) rotate(0.1deg); }
          50% { transform: translateY(0.8px) rotate(-0.1deg); }
          100% { transform: translateY(-0.8px) rotate(0.1deg); }
        }
      `}</style>
    </div>
  );
}
