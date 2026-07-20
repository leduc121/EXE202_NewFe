import React, { useState } from 'react';
import { PITCH_FREQ } from '../songsData';
import { audioEngine } from '../utils/AudioEngine';
import { nearestPitch } from '../utils/pitchMapping';

interface SaoTrucSimulatorProps {
  activePitches: string[];
  onKeyTrigger?: (pitch: string, frequency: number) => void;
}

interface FluteHole {
  id: number;
  label: string;
  noteMap: string; // Associated primary note
  frequency: number;
  offsetPercent: number; // position on bamboo flute (left-aligned)
}

const FLUTE_HOLES: FluteHole[] = [
  { id: 1, label: 'Đô', noteMap: 'C5', frequency: PITCH_FREQ['C5'], offsetPercent: 40 },
  { id: 2, label: 'Rê', noteMap: 'D5', frequency: PITCH_FREQ['D5'], offsetPercent: 49 },
  { id: 3, label: 'Mi', noteMap: 'E5', frequency: PITCH_FREQ['E5'], offsetPercent: 57 },
  { id: 4, label: 'Sol', noteMap: 'G5', frequency: PITCH_FREQ['G5'], offsetPercent: 66 },
  { id: 5, label: 'La', noteMap: 'A5', frequency: PITCH_FREQ['A5'], offsetPercent: 74 },
  { id: 6, label: 'Si', noteMap: 'B5', frequency: PITCH_FREQ['B5'], offsetPercent: 82 },
];

const FLUTE_PLAYABLE_NOTES = FLUTE_HOLES.map((hole) => hole.noteMap);

export default function SaoTrucSimulator({ activePitches, onKeyTrigger }: SaoTrucSimulatorProps) {
  const [localActiveHoles, setLocalActiveHoles] = useState<number[]>([]);
  const mappedActivePitches = activePitches
    .map((pitch) => nearestPitch(pitch, FLUTE_PLAYABLE_NOTES))
    .filter((pitch): pitch is string => Boolean(pitch));

  // Sound triggering
  const handleTriggerHole = (hole: FluteHole) => {
    audioEngine.playNote(hole.noteMap, hole.frequency, 'sao_truc', 1.0);
    setLocalActiveHoles(prev => [...prev, hole.id]);
    setTimeout(() => {
      setLocalActiveHoles(prev => prev.filter(id => id !== hole.id));
    }, 450);

    if (onKeyTrigger) {
      onKeyTrigger(hole.noteMap, hole.frequency);
    }
  };

  // Check if a hole should be visually closed based on active pitch
  // C5 closes all holes, D5 closes 5, E5 closes 4, G5 closes 3, A5 closes 2, B5 closes 1
  const isHoleClosedByPlayback = (holeId: number, activeNotes: string[]): boolean => {
    if (activeNotes.length === 0) return false;
    const currentActiveNote = activeNotes[0]; // Take primary note

    const fingeringMap: Record<string, number> = {
      'C5': 6,
      'D5': 5,
      'E5': 4,
      'G5': 3,
      'A5': 2,
      'B5': 1,
    };

    const countToClose = fingeringMap[currentActiveNote] || 0;
    return holeId <= countToClose;
  };

  return (
    <div id="sao-truc-simulator" className="w-full flex flex-col pt-3 pb-5 bg-gradient-to-b from-[#0b1019] to-[#04070a] border border-[#162132] rounded-2xl p-6 shadow-2xl relative select-none">
      {/* Decorative top header */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#1b3409] via-[#2f551c] to-[#122406] rounded-t-2xl border-b border-[#000] flex items-center justify-between px-8">
        <span className="text-[7.5px] tracking-[0.25em] text-[#aecf9b] font-semibold opacity-70">VIETNAMESE BAMBOO FLUTE (SÁO TRÚC)</span>
        <span className="w-2.5 h-1 bg-[#aecf9b] rounded-full animate-pulse"></span>
      </div>

      <div className="w-full flex justify-between items-center mb-5 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#407f18] rounded-full"></span>
          <span className="text-xs font-bold text-[#adbcd7] uppercase tracking-wider">Sáo Trúc Wind Tube</span>
        </div>
        <span className="text-[10px] text-[#4d5c75] border border-[#1a293f] px-1.5 py-0.5 rounded">Click finger holes to cover and blow</span>
      </div>

      {/* The Flute Body */}
      <div className="relative w-full h-[180px] bg-gradient-to-b from-[#0e121a] via-[#101b13] to-[#0e121a] rounded-xl overflow-hidden border border-[#183617] p-4 flex flex-col justify-center items-center">
        {/* Horizontal Bamboo Log container */}
        <div className="relative w-[92%] h-10 bg-gradient-to-b from-[#aed581] via-[#81c784] to-[#388e3c] rounded-full border border-[#2e5e2e] shadow-lg shadow-[#000]/40 flex items-center z-10">
          {/* Thread wraps (Decorative binding nodes/joints of traditional bamboo flutes) */}
          <div className="absolute left-[3%] w-2.5 h-full bg-[#1b5e20] opacity-80 shadow"></div>
          <div className="absolute left-[20%] w-2 h-full bg-[#1b5e20] opacity-80 shadow"></div>
          <div className="absolute left-[35%] w-2 h-full bg-[#33691e] opacity-60 shadow"></div>
          <div className="absolute left-[92%] w-3 h-full bg-[#1b5e20] opacity-80 shadow"></div>

          {/* Blow hole (Embouchure / Lỗ Thổi) at segment 1 */}
          <div className="absolute left-[12%] w-5 h-5 bg-[#0a2007] rounded-full border border-[#2e7d32] flex items-center justify-center cursor-pointer hover:bg-[#1b5e20]">
            <div className="w-2 h-2 bg-black rounded-full shadow-inner animate-pulse"></div>
          </div>

          {/* The Six Playing Finger Holes */}
          {FLUTE_HOLES.map((hole) => {
            const isClosed = isHoleClosedByPlayback(hole.id, mappedActivePitches) || localActiveHoles.includes(hole.id);

            return (
              <button
                key={hole.id}
                id={`flute-hole-${hole.id}`}
                onClick={() => handleTriggerHole(hole)}
                style={{ left: `${hole.offsetPercent}%` }}
                className="absolute w-7 h-7 -translate-x-3.5 flex flex-col items-center justify-center cursor-pointer group hover:scale-110 z-20"
              >
                {/* Finger Hole shape */}
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    isClosed
                      ? 'bg-gradient-to-b from-[#ffb85a] to-[#df7212] border-white shadow-[0_0_12px_#ff9f2a]'
                      : 'bg-black border-[#2e5e2e] group-hover:bg-[#1b5e20]'
                  }`}
                />
                
                {/* Hole Note Identifier Overlay */}
                <span className={`text-[8.5px] font-mono font-bold mt-1.5 transition-colors duration-150 ${
                  isClosed ? 'text-amber-400' : 'text-[#a4b2c7] opacity-60 group-hover:opacity-100'
                }`}>
                  {hole.noteMap}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fingering helper text below flute */}
        <div className="mt-4 flex gap-4 text-[10px] font-bold text-[#445b42]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ffb85a] to-[#df7212]"></span>
            <span>Covered (Lit)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#111] border border-[#2e5e2e]"></span>
            <span>Open (Unlit)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
