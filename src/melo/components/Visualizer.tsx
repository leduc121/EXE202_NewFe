import React, { useEffect, useRef, useState } from 'react';

interface VisualizerProps {
  isPlaying: boolean;
  isVisualizerOn: boolean;
}

export default function Visualizer({ isPlaying, isVisualizerOn }: VisualizerProps) {
  const [bounces, setBounces] = useState<number[]>(Array.from({ length: 64 }, () => 15));
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isVisualizerOn) return;

    let phase = 0;
    const updateSpectrum = () => {
      phase += 0.08;
      
      setBounces((prev) => {
        return prev.map((val, idx) => {
          if (!isPlaying) {
            // Calm, low, breathing ripples
            return 12 + Math.sin(phase + idx * 0.15) * 4;
          }

          // Active dancing frequency columns
          const baseWave = Math.sin(phase + idx * 0.18) * 20;
          const multiCosine = Math.cos(phase * 1.5 + idx * 0.4) * 12;
          const randomTremble = Math.random() * 8;
          
          // Form a bell curve/envelope centered around middle indices
          const distFromCenter = Math.abs(idx - 32) / 32;
          const decayEnvelope = Math.max(0.1, 1 - distFromCenter * 0.85);

          const rawHeight = 15 + (Math.abs(baseWave + multiCosine) + randomTremble) * decayEnvelope;
          return Math.max(8, Math.min(75, rawHeight));
        });
      });

      requestRef.current = requestAnimationFrame(updateSpectrum);
    };

    requestRef.current = requestAnimationFrame(updateSpectrum);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, isVisualizerOn]);

  if (!isVisualizerOn) return null;

  return (
    <div id="dynamic-visualizer-bar" className="w-full relative h-[78px] bg-gradient-to-t from-[#03060c] via-[#050b16] to-[#0a1223]/20 flex items-end justify-center px-4 overflow-hidden select-none border-t border-[#111927]">
      {/* Dynamic ambient background glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-fuchsia-500/5 to-purple-500/5 pointer-events-none filter blur-xl"></div>

      {/* Floating high-intensity flare particles */}
      <div className="absolute top-1/2 left-1/4 w-32 h-6 bg-cyan-400/5 rounded-full filter blur-xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-6 bg-purple-500/5 rounded-full filter blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      {/* 64 Glowing equalizer vertical bars matching screenshot */}
      <div className="w-full max-w-7xl h-full flex items-end justify-between px-2 md:px-6 relative z-10">
        {bounces.map((val, idx) => {
          const ratio = idx / bounces.length;
          
          // Dual gradient matching the cyan-to-violet wavy spectrum from picture
          const r = Math.floor(34 + ratio * (168 - 34));   // Cyan (34) to Violet (168)
          const g = Math.floor(211 - ratio * (211 - 50));  // Cyan (211) to Violet (50)
          const b = Math.floor(238 + ratio * (250 - 238)); // Cyan (238) to Violet (250)
          
          const barColor = `rgb(${r}, ${g}, ${b})`;
          const glowShadow = `0 0 10px rgba(${r}, ${g}, ${b}, 0.5), 0 0 2px rgba(${r}, ${g}, ${b}, 0.8)`;

          return (
            <div
              key={idx}
              className="w-[1.2%] md:w-[1.0%] min-h-[4px] rounded-t-full transition-all duration-75 ease-out"
              style={{
                height: `${val}%`,
                background: `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 0.15) 0%, ${barColor} 100%)`,
                boxShadow: isPlaying ? glowShadow : 'none',
                opacity: isPlaying ? 0.9 : 0.45
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
