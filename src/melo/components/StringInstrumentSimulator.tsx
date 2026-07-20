import React, { useState } from 'react';
import { InstrumentType } from '../types';
import { PITCH_FREQ } from '../songsData';
import { audioEngine } from '../utils/AudioEngine';
import { nearestPitch } from '../utils/pitchMapping';

interface StringInstrumentSimulatorProps {
  instrument: Extract<InstrumentType, 'guitar' | 'violin'>;
  activePitches: string[];
  onKeyTrigger?: (pitch: string, frequency: number) => void;
}

interface StringDefinition {
  label: string;
  pitch: string;
}

const GUITAR_STRINGS: StringDefinition[] = [
  { label: 'E', pitch: 'E4' },
  { label: 'B', pitch: 'B3' },
  { label: 'G', pitch: 'G3' },
  { label: 'D', pitch: 'D3' },
  { label: 'A', pitch: 'A2' },
  { label: 'E', pitch: 'E3' },
];

const VIOLIN_STRINGS: StringDefinition[] = [
  { label: 'E', pitch: 'E5' },
  { label: 'A', pitch: 'A4' },
  { label: 'D', pitch: 'D4' },
  { label: 'G', pitch: 'G3' },
];

const getStrings = (instrument: StringInstrumentSimulatorProps['instrument']) =>
  instrument === 'guitar' ? GUITAR_STRINGS : VIOLIN_STRINGS;

export default function StringInstrumentSimulator({
  instrument,
  activePitches,
  onKeyTrigger,
}: StringInstrumentSimulatorProps) {
  const [localActiveStrings, setLocalActiveStrings] = useState<string[]>([]);
  const strings = getStrings(instrument);
  const playableNotes = strings.map((string) => string.pitch);
  const mappedActivePitches = activePitches
    .map((pitch) => nearestPitch(pitch, playableNotes))
    .filter((pitch): pitch is string => Boolean(pitch));
  const isGuitar = instrument === 'guitar';

  const handleStringTrigger = (string: StringDefinition) => {
    const frequency = PITCH_FREQ[string.pitch] || 440;
    audioEngine.playNote(string.pitch, frequency, instrument, isGuitar ? 1.1 : 1.4);
    setLocalActiveStrings((prev) => [...prev, string.pitch]);
    setTimeout(() => {
      setLocalActiveStrings((prev) => prev.filter((pitch) => pitch !== string.pitch));
    }, isGuitar ? 700 : 1000);

    if (onKeyTrigger) {
      onKeyTrigger(string.pitch, frequency);
    }
  };

  return (
    <div className="w-full flex flex-col pt-3 pb-5 bg-gradient-to-b from-[#0b1019] to-[#04070a] border border-[#162132] rounded-2xl p-6 shadow-2xl relative select-none">
      <div className={`absolute top-0 left-0 right-0 h-4 rounded-t-2xl border-b border-[#000] flex items-center justify-between px-8 ${
        isGuitar
          ? 'bg-gradient-to-r from-[#2b1607] via-[#59310d] to-[#1c0d03]'
          : 'bg-gradient-to-r from-[#2a0909] via-[#511817] to-[#160405]'
      }`}>
        <span className={`text-[7.5px] tracking-[0.25em] font-semibold opacity-75 ${
          isGuitar ? 'text-[#e9b477]' : 'text-[#ef9f95]'
        }`}>
          {isGuitar ? 'ACOUSTIC GUITAR STRING BOARD' : 'VIOLIN STRING BOARD'}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full shadow-md ${
          isGuitar ? 'bg-[#ffba5a] shadow-[#ffba5a]' : 'bg-[#ff766b] shadow-[#ff766b]'
        }`} />
      </div>

      <div className="w-full flex justify-between items-center mb-5 mt-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-1.5 rounded-full ${isGuitar ? 'bg-[#d9913c]' : 'bg-[#dd5f55]'}`} />
          <span className="text-xs font-bold text-[#adbcd7] uppercase tracking-wider">
            {isGuitar ? 'Guitar fretboard' : 'Violin fingerboard'}
          </span>
        </div>
        <span className="text-[10px] text-[#4d5c75] font-mono border border-[#1a293f] px-1.5 py-0.5 rounded">
          Click strings to play
        </span>
      </div>

      <div className={`relative w-full h-[180px] rounded-xl overflow-hidden border shadow-inner p-4 flex flex-col justify-between ${
        isGuitar
          ? 'bg-gradient-to-b from-[#120c06] via-[#241307] to-[#0d0804] border-[#33200f]'
          : 'bg-gradient-to-b from-[#120809] via-[#240d0d] to-[#090404] border-[#351313]'
      }`}>
        {isGuitar && (
          <div className="absolute inset-y-4 left-[17%] right-[10%] grid grid-cols-8 pointer-events-none opacity-55">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} className="border-r border-[#9b7a54]/25" />
            ))}
          </div>
        )}
        {!isGuitar && (
          <div className="absolute left-[7%] right-[7%] top-1/2 h-24 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#090404] via-[#1f0d0d] to-[#090404] border border-[#361515]/70 pointer-events-none" />
        )}

        {strings.map((string, index) => {
          const isActive =
            mappedActivePitches.includes(string.pitch) || localActiveStrings.includes(string.pitch);
          return (
            <button
              key={`${string.label}-${string.pitch}`}
              type="button"
              onClick={() => handleStringTrigger(string)}
              className="relative h-5 flex items-center cursor-pointer group"
            >
              <span className={`absolute left-0 z-10 w-9 text-[10px] font-bold font-mono text-right pr-3 ${
                isActive ? 'text-[#ffcf7a]' : 'text-[#5d6a7d]'
              }`}>
                {string.label}
              </span>
              <span
                className={`absolute left-12 right-4 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'h-[3px] bg-gradient-to-r from-[#ffb85a] via-white to-[#ffb85a] shadow-[0_0_14px_rgba(255,173,77,0.95)]'
                    : 'h-[1.5px] bg-gradient-to-r from-[#4d4234] via-[#c8b08d] to-[#4d4234] group-hover:h-[2px]'
                }`}
                style={{
                  animation: isActive ? 'string-vibrate 0.08s linear infinite' : 'none',
                  opacity: 1 - index * 0.05,
                }}
              />
              <span className={`absolute right-5 z-10 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isActive
                  ? 'text-white border-[#d98a2d] bg-[#ffad4d]/20'
                  : 'text-[#46556b] border-transparent bg-[#050912]/70'
              }`}>
                {string.pitch}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes string-vibrate {
          0% { transform: translateY(-0.7px); }
          50% { transform: translateY(0.7px); }
          100% { transform: translateY(-0.7px); }
        }
      `}</style>
    </div>
  );
}
