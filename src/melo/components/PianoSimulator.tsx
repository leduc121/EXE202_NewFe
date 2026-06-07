import React, { useEffect, useState } from 'react';
import { PITCH_FREQ } from '../songsData';
import { audioEngine } from '../utils/AudioEngine';

interface PianoSimulatorProps {
  activePitches: string[];
  onKeyTrigger?: (pitch: string, frequency: number) => void;
}

interface PianoKey {
  pitch: string;
  isBlack: boolean;
  frequency: number;
  keyboardBind: string;
}

const PIANO_KEYS: PianoKey[] = [
  { pitch: 'C4', isBlack: false, frequency: PITCH_FREQ['C4'], keyboardBind: 'A' },
  { pitch: 'C#4', isBlack: true, frequency: PITCH_FREQ['C#4'], keyboardBind: 'W' },
  { pitch: 'D4', isBlack: false, frequency: PITCH_FREQ['D4'], keyboardBind: 'S' },
  { pitch: 'D#4', isBlack: true, frequency: PITCH_FREQ['D#4'], keyboardBind: 'E' },
  { pitch: 'E4', isBlack: false, frequency: PITCH_FREQ['E4'], keyboardBind: 'D' },
  { pitch: 'F4', isBlack: false, frequency: PITCH_FREQ['F4'], keyboardBind: 'F' },
  { pitch: 'F#4', isBlack: true, frequency: PITCH_FREQ['F#4'], keyboardBind: 'T' },
  { pitch: 'G4', isBlack: false, frequency: PITCH_FREQ['G4'], keyboardBind: 'G' },
  { pitch: 'G#4', isBlack: true, frequency: PITCH_FREQ['G#4'], keyboardBind: 'Y' },
  { pitch: 'A4', isBlack: false, frequency: PITCH_FREQ['A4'], keyboardBind: 'H' },
  { pitch: 'A#4', isBlack: true, frequency: PITCH_FREQ['A#4'], keyboardBind: 'U' },
  { pitch: 'B4', isBlack: false, frequency: PITCH_FREQ['B4'], keyboardBind: 'J' },

  { pitch: 'C5', isBlack: false, frequency: PITCH_FREQ['C5'], keyboardBind: 'K' },
  { pitch: 'C#5', isBlack: true, frequency: PITCH_FREQ['C#5'], keyboardBind: 'O' },
  { pitch: 'D5', isBlack: false, frequency: PITCH_FREQ['D5'], keyboardBind: 'L' },
  { pitch: 'D#5', isBlack: true, frequency: PITCH_FREQ['D#5'], keyboardBind: 'P' },
  { pitch: 'E5', isBlack: false, frequency: PITCH_FREQ['E5'], keyboardBind: ';' },
  { pitch: 'F5', isBlack: false, frequency: PITCH_FREQ['F5'], keyboardBind: "'" },
  { pitch: 'F#5', isBlack: true, frequency: PITCH_FREQ['F#5'], keyboardBind: '[' },
  { pitch: 'G5', isBlack: false, frequency: PITCH_FREQ['G5'], keyboardBind: 'Z' },
  { pitch: 'G#5', isBlack: true, frequency: PITCH_FREQ['G#5'], keyboardBind: 'X' },
  { pitch: 'A5', isBlack: false, frequency: PITCH_FREQ['A5'], keyboardBind: 'C' },
  { pitch: 'A#5', isBlack: true, frequency: PITCH_FREQ['A#5'], keyboardBind: 'V' },
  { pitch: 'B5', isBlack: false, frequency: PITCH_FREQ['B5'], keyboardBind: 'B' },
  
  { pitch: 'C6', isBlack: false, frequency: PITCH_FREQ['C6'], keyboardBind: 'N' }
];

export default function PianoSimulator({ activePitches, onKeyTrigger }: PianoSimulatorProps) {
  const [localActiveKeys, setLocalActiveKeys] = useState<string[]>([]);

  // Safe trigger logic
  const handleKeyPress = (key: PianoKey) => {
    audioEngine.playNote(key.pitch, key.frequency, 'piano', 0.8);
    setLocalActiveKeys(prev => [...prev, key.pitch]);
    setTimeout(() => {
      setLocalActiveKeys(prev => prev.filter(k => k !== key.pitch));
    }, 250);

    if (onKeyTrigger) {
      onKeyTrigger(key.pitch, key.frequency);
    }
  };

  // Keyboard binding action listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Prevent loop repeat triggers
      const targetKey = PIANO_KEYS.find(k => k.keyboardBind.toLowerCase() === e.key.toLowerCase());
      if (targetKey) {
        handleKeyPress(targetKey);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyTrigger]);

  const whiteKeys = PIANO_KEYS.filter(k => !k.isBlack);
  const blackKeys = PIANO_KEYS.filter(k => k.isBlack);

  // Mapping to place black key offsets appropriately relative to white key indices
  // C#4 is after C4, D#4 is after D4, F#4 is after F4, G#4 is after G4, A#4 is after A4
  const getBlackKeyLeftOffset = (pitch: string): string => {
    const whitePositions: Record<string, number> = {
      'C#4': 6.2,  // between C4 and D4
      'D#4': 13.0, // between D4 and E4
      'F#4': 26.3, // between F4 and G4
      'G#4': 33.1, // between G4 and A4
      'A#4': 39.8, // between A4 and B4
      'C#5': 53.0, // between C5 and D5
      'D#5': 59.8, // between D5 and E5
      'F#5': 73.0, // between F5 and G5
      'G#5': 79.8, // between G5 and A5
      'A#5': 86.5  // between A5 and B5
    };
    return `${whitePositions[pitch] || 0}%`;
  };

  return (
    <div id="piano-simulator" className="w-full flex flex-col pt-3 pb-5 bg-gradient-to-b from-[#0b1019] to-[#04070a] border border-[#162132] rounded-2xl p-6 shadow-2xl relative select-none">
      {/* Decorative top wooden frame matching screenshot */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#211409] via-[#3d2410] to-[#1d1107] rounded-t-2xl border-b border-[#000] flex items-center justify-between px-8">
        <span className="text-[7.5px] tracking-[0.25em] text-[#bf7e3b] font-semibold opacity-70">MELODIX AUDIO CRAFT</span>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-[#4c1605] rounded-full"></span>
          <span className="w-1.5 h-1.5 bg-[#411405] rounded-full"></span>
        </div>
      </div>

      <div className="w-full flex justify-between items-center mb-5 mt-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#ffad4d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M7 3v12M11 3v12M15 3v12M19 3v12M3 15h18" />
          </svg>
          <span className="text-xs font-bold text-[#adbcd7] uppercase tracking-wider">Virtual Piano Component</span>
        </div>
        <div className="flex gap-2 text-[10px] text-[#4d5c75] font-mono font-medium">
          <span className="border border-[#1a293f] px-1.5 py-0.5 rounded">A-N Keys</span>
          <span className="border border-[#1a293f] px-1.5 py-0.5 rounded">W-Y Black Keys</span>
        </div>
      </div>

      {/* The Keyboard Board container */}
      <div className="relative w-full h-[180px] bg-[#020509] rounded-xl overflow-hidden shadow-inner flex border border-black pt-[3px] pr-[1px]">
        {/* White Keys */}
        {whiteKeys.map((key) => {
          const isGlowing = activePitches.includes(key.pitch) || localActiveKeys.includes(key.pitch);
          return (
            <button
              key={key.pitch}
              id={`key-white-${key.pitch}`}
              onClick={() => handleKeyPress(key)}
              style={{ width: `${100 / whiteKeys.length}%` }}
              className={`h-full relative border-r border-[#151c28] border-b-[8px] border-b-[#d5deeb] transition-all duration-100 flex flex-col justify-end items-center pb-2 cursor-pointer ${
                isGlowing
                  ? 'bg-gradient-to-b from-amber-400 to-[#e08c1f] border-b-[#fcd28d] scale-x-[0.98] z-20 shadow-[0_0_24px_rgba(255,173,77,0.8),inset_0_-8px_18px_rgba(255,173,77,0.7)]'
                  : 'bg-gradient-to-b from-white to-[#f0f4fa] hover:from-[#f9fafc] hover:to-[#ebf0f7]'
              }`}
            >
              {/* Note name & Key label */}
              <div className="flex flex-col gap-0.5 items-center">
                <span className={`text-[9px] font-bold ${isGlowing ? 'text-black' : 'text-[#8598b0]'} font-mono`}>
                  {key.keyboardBind}
                </span>
                <span className={`text-[10px] font-extrabold ${isGlowing ? 'text-black' : 'text-[#3c4a5c]'} font-sans`}>
                  {key.pitch}
                </span>
              </div>
            </button>
          );
        })}

        {/* Black Keys overlaid absolute */}
        {blackKeys.map((key) => {
          const isGlowing = activePitches.includes(key.pitch) || localActiveKeys.includes(key.pitch);
          return (
            <button
              key={key.pitch}
              id={`key-black-${key.pitch}`}
              onClick={() => handleKeyPress(key)}
              style={{
                left: getBlackKeyLeftOffset(key.pitch),
                width: `${100 / whiteKeys.length * 0.65}%`,
                height: '62%'
              }}
              className={`absolute top-0 rounded-b-md border-b-[6px] border-b-[#000] z-30 transition-all duration-100 flex flex-col justify-end items-center pb-2.5 cursor-pointer ${
                isGlowing
                  ? 'bg-gradient-to-b from-[#ffa620] to-[#ff7b00] border-b-[#ffad4d] scale-[0.96] shadow-[0_0_20px_rgba(255,173,77,0.8),inset_0_-4px_12px_rgba(255,173,77,0.6)]'
                  : 'bg-gradient-to-b from-[#1c2430] to-[#04060a] border-x border-[#121720]/85 hover:from-[#212c3b] hover:to-[#090e14]'
              }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className={`text-[8px] font-bold ${isGlowing ? 'text-black' : 'text-[#5d6a7f]'} font-mono`}>
                  {key.keyboardBind}
                </span>
                <span className={`text-[8.5px] font-extrabold ${isGlowing ? 'text-black' : 'text-[#8799b3]'} font-sans`}>
                  {key.pitch}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
