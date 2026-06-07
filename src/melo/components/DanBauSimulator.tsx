import React, { useState } from 'react';
import { PITCH_FREQ } from '../songsData';
import { audioEngine } from '../utils/AudioEngine';

interface DanBauSimulatorProps {
  activePitches: string[];
  onKeyTrigger?: (pitch: string, frequency: number) => void;
}

interface HarmonicNode {
  pitch: string;
  vietName: string;
  frequency: number;
  label: string;
  positionX: number; // percent index along string (approximate harmonic divide)
}

const BAU_NODES: HarmonicNode[] = [
  { pitch: 'C3', vietName: 'Hò Trầm', frequency: PITCH_FREQ['C3'], label: 'Hò Trầm', positionX: 20 },
  { pitch: 'E3', vietName: 'Mơ Trầm', frequency: PITCH_FREQ['E3'], label: 'Mơ Trầm', positionX: 35 },
  { pitch: 'G3', vietName: 'Xê Trầm', frequency: PITCH_FREQ['G3'], label: 'Xê Trầm', positionX: 50 },
  { pitch: 'C4', vietName: 'Hò', frequency: PITCH_FREQ['C4'], label: 'Hò', positionX: 65 },
  { pitch: 'E4', vietName: 'Mơ', frequency: PITCH_FREQ['E4'], label: 'Mơ', positionX: 75 },
  { pitch: 'G4', vietName: 'Xê', frequency: PITCH_FREQ['G4'], label: 'Xê', positionX: 85 },
  { pitch: 'C5', vietName: 'Líu', frequency: PITCH_FREQ['C5'], label: 'Líu', positionX: 93 },
];

export default function DanBauSimulator({ activePitches, onKeyTrigger }: DanBauSimulatorProps) {
  const [pitchBend, setPitchBend] = useState<number>(0); // -100 to 100 pitch bend cents
  const [isVibrating, setIsVibrating] = useState<boolean>(false);
  const [currentTone, setCurrentTone] = useState<string>('C4');

  const handleTriggerNode = (node: HarmonicNode) => {
    // Modify frequency by active bend ratio: e.g. -20% to +30% frequency slide
    const bendFactor = 1 + (pitchBend / 200);
    const adjustedFreq = node.frequency * bendFactor;

    setCurrentTone(node.pitch);
    audioEngine.playNote(node.pitch, adjustedFreq, 'dan_bau', 1.5);
    setIsVibrating(true);
    setTimeout(() => {
      setIsVibrating(false);
    }, 1200);

    if (onKeyTrigger) {
      onKeyTrigger(node.pitch, adjustedFreq);
    }
  };

  const handleBendChange = (val: number) => {
    setPitchBend(val);
    // If a note is activated or recently plucked, we play bend update
    const matchingNode = BAU_NODES.find(n => n.pitch === currentTone) || BAU_NODES[3];
    const bendFactor = 1 + (val / 200);
    const adjustedFreq = matchingNode.frequency * bendFactor;
    audioEngine.playNote(matchingNode.pitch, adjustedFreq, 'dan_bau', 1.0);
  };

  return (
    <div id="dan-bau-simulator" className="w-full flex flex-col pt-3 pb-5 bg-gradient-to-b from-[#0b1019] to-[#04070a] border border-[#162132] rounded-2xl p-6 shadow-2xl relative select-none">
      {/* Wood header framing */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-[#200f02] via-[#3a1d04] to-[#120801] rounded-t-2xl border-b border-[#000] flex items-center justify-between px-8">
        <span className="text-[7.5px] tracking-[0.25em] text-[#ce7e4f] font-semibold opacity-70">VIETNAMESE MONOCHORD (ĐẦN BẦU)</span>
        <span className="w-1.5 h-1.5 bg-[#ce7e4f] rounded-full animate-ping"></span>
      </div>

      <div className="w-full flex justify-between items-center mb-5 mt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-1.5 bg-[#df703c] rounded-full animate-bounce"></span>
          <span className="text-xs font-bold text-[#adbcd7] uppercase tracking-wider">Đàn Bầu Monochord Space</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#4d5c75]">
          <span className="border border-[#1a293f] px-1.5 py-0.5 rounded">1 String Harmonics</span>
        </div>
      </div>

      {/* The Monochord Body */}
      <div className="relative w-full h-[180px] bg-gradient-to-b from-[#111] via-[#1b1008] to-[#111] rounded-xl overflow-hidden border border-[#2b1708] shadow-inner p-4 flex items-center justify-between">
        {/* Monochord Board body graphic layout */}
        <div className="absolute inset-y-0 right-4 left-32 bg-gradient-to-b from-[#0f0905] via-[#2f1406] to-[#0f0905] rounded-l border border-[#44230d]/30 shadow-inner flex items-center pr-3 pointer-events-none">
          <span className="text-[110px] text-[#dcae78] font-serif font-extrabold rotate-3 select-none ml-20 opacity-3">HẰNG HỮU</span>
        </div>

        {/* CẦN ĐÀN (The Pitch Bend handle basket on the left) */}
        <div className="relative w-28 h-full flex flex-col justify-center items-center shrink-0 border-r border-[#1a1c22]">
          {/* Draggable/Bend handle slider */}
          <div className="flex flex-col items-center gap-1 mt-1 justify-center z-20">
            <span className="text-[9px] font-sans font-bold text-[#ffb570] tracking-wider animate-pulse">PITCH BEND</span>
            {/* The Handle slider */}
            <input
              id="dan-bau-bend-slider"
              type="range"
              min="-100"
              max="100"
              value={pitchBend}
              onChange={(e) => handleBendChange(parseInt(e.target.value))}
              className="w-24 h-1 bg-[#151d29] rounded-lg appearance-none cursor-pointer border border-[#273244]"
            />
            {/* Decorative slide handle values */}
            <div className="flex justify-between w-24 text-[8px] font-mono text-[#434f63] font-bold">
              <span>TRÙNG (Cents)</span>
              <span className={pitchBend !== 0 ? 'text-[#ffad4d]' : ''}>
                {pitchBend > 0 ? `+${pitchBend}` : pitchBend}
              </span>
              <span>CĂNG</span>
            </div>
          </div>

          {/* Bamboo stem curved illustration */}
          <div className="absolute top-2 left-10 w-16 h-[140px] pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 80 140">
              {/* Curved rod that tilts according to pitch bend */}
              <path
                d={`M25 120 Q ${42 + pitchBend * 0.15} 60 ${35 + pitchBend * 0.25} 12`}
                stroke="#dcae78"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
              <path
                d={`M25 120 Q ${42 + pitchBend * 0.15} 60 ${35 + pitchBend * 0.25} 12`}
                stroke="#683d10"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                className="transition-all duration-150 ease-out"
              />
              {/* BẦU - Half Gourd element */}
              <circle
                cx={35 + pitchBend * 0.25}
                cy="14"
                r="10"
                fill="#8f4d1e"
                stroke="#3d1b06"
                strokeWidth="1.5"
                className="transition-all duration-150 ease-out"
              />
              {/* Base connector socket */}
              <ellipse cx="25" cy="118" rx="8" ry="4" fill="#333" />
            </svg>
          </div>
        </div>

        {/* Interactive monochord string line & nodes */}
        <div className="relative flex-1 h-full flex items-center">
          {/* THE SINGLE STRING */}
          <div
            className={`absolute left-0 right-0 h-[2px] transition-all duration-200 ${
              isVibrating
                ? 'bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-[0_0_12px_#ff9f2a]'
                : 'bg-gradient-to-r from-[#222] via-[#e2c194] to-[#222]'
            }`}
            style={{
              animation: isVibrating ? 'vibrate 0.08s linear infinite' : 'none',
              transform: `translateY(${-pitchBend * 0.04}px)` // String tilts with handle pull
            }}
          />

          {/* Harmonic node trigger points */}
          {BAU_NODES.map((node) => {
            const isNoteMatching = activePitches.includes(node.pitch);
            return (
              <button
                key={node.pitch}
                id={`harmonic-node-${node.pitch}`}
                onClick={() => handleTriggerNode(node)}
                style={{ left: `${node.positionX}%` }}
                className={`absolute w-7 h-7 -translate-x-3.5 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                  isNoteMatching
                    ? 'bg-[#ffad4d] border-white scale-115 shadow-[0_0_15px_#ff9d00]'
                    : 'bg-[#152033]/90 border-[#2f3f58] text-[#7185a0] hover:bg-[#1a2b44] hover:text-white'
                }`}
              >
                <div className="flex flex-col items-center scale-90">
                  <span className="text-[7.5px] font-sans font-bold leading-none select-none">
                    {node.vietName.split(' ')[0]}
                  </span>
                  <span className="text-[7.5px] font-mono font-medium opacity-80 leading-none mt-0.5">
                    {node.pitch}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
