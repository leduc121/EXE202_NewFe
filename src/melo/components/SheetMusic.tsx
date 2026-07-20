import React, { useRef, useMemo } from 'react';
import { Song } from '../types';

interface SheetMusicProps {
  song: Song;
  currentTime: number;
  onNoteClick?: (pitch: string, frequency: number) => void;
}

// Maps musical pitches to staff positions (0 = Middle C, line/space increments)
const PITCH_STAFF_OFFSET: Record<string, number> = {
  'C3': -7, 'C#3': -7, 'D3': -6, 'D#3': -6, 'E3': -5, 'F3': -4, 'F#3': -4, 'G3': -3, 'G#3': -3, 'A3': -2, 'A#3': -2, 'B3': -1,
  'C4': 0, 'C#4': 0, 'D4': 1, 'D#4': 1, 'E4': 2, 'F4': 3, 'F#4': 3, 'G4': 4, 'G#4': 4, 'A4': 5, 'A#4': 5, 'B4': 6,
  'C5': 7, 'C#5': 7, 'D5': 8, 'D#5': 8, 'E5': 9, 'F5': 10, 'F#5': 10, 'G5': 11, 'G#5': 11, 'A5': 12, 'A#5': 12, 'B5': 13,
  'C6': 14
};

const getKeySignatureSharps = (songKey: string) => {
  const normalizedKey = songKey?.toLowerCase() || '';
  if (normalizedKey.includes('c#') || normalizedKey.includes('f#') || normalizedKey.includes('c sharp')) {
    return 4; // F#, C#, G#, D#
  }
  if (normalizedKey.includes('g major') || normalizedKey.includes('e minor') || normalizedKey.startsWith('g ')) {
    return 1; // F#
  }
  return 0; // C Major / A Minor
};

const truncateScoreText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trim()}...`;
};

export default function SheetMusic({ song, currentTime, onNoteClick }: SheetMusicProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPaperTheme = true;

  // Divide song duration across 3 beautiful staves
  const staffRanges = useMemo(() => {
    const total = song.duration || 30;
    const count = 3;
    const step = total / count;
    return Array.from({ length: count }, (_, idx) => ({
      start: idx * step,
      end: (idx + 1) * step,
      index: idx
    }));
  }, [song.duration]);

  // Parameters for rendering staff lines
  const STAFF_SPACING = 55; // vertical separation between staves
  const STAFF_HEIGHT = 36;  // 4 steps of 9px each = 5 lines spaced by 9px
  const LINE_STEP = 9;
  const TOP_PADDING = 95;
  const STAFF_X_START = 80;
  const scoreTitle = truncateScoreText(song.title, 72);
  const scoreArtist = truncateScoreText(song.artist, 28);

  // Get active staff and cursor coordinates
  const cursorInfo = useMemo(() => {
    const total = song.duration || 32;
    
    // Find active staff index
    let activeIndex = staffRanges.findIndex(r => currentTime >= r.start && currentTime <= r.end);
    if (activeIndex === -1) {
      activeIndex = currentTime >= total ? staffRanges.length - 1 : 0;
    }
    
    const range = staffRanges[activeIndex];
    const durationOnThisStaff = range.end - range.start;
    const timeOnThisStaff = currentTime - range.start;
    const percentWidth = Math.max(0, Math.min(1, timeOnThisStaff / durationOnThisStaff));
    
    return {
      activeIndex,
      percentWidth,
    };
  }, [currentTime, song.duration, staffRanges]);

  const numSharps = useMemo(() => getKeySignatureSharps(song.key), [song.key]);
  const beatsPerMeasure = useMemo(() => parseInt(song.timeSignature?.split('/')[0] || '4', 10), [song.timeSignature]);
  const measureDuration = useMemo(() => (beatsPerMeasure * 60) / (song.tempo || 72), [beatsPerMeasure, song.tempo]);

  return (
    <div 
      id="sheet-music-panel" 
      className={`w-full relative rounded-2xl p-4 md:p-6 transition-all duration-300 select-none overflow-hidden ${
        isPaperTheme 
          ? 'bg-[#fcfbf9] border border-[#e3dfd3] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.06)]' 
          : 'bg-[#090f19] border border-[#1a2638] shadow-2xl'
      }`}
    >
      {/* Subtle vignette/glow borders */}
      {isPaperTheme ? (
        <div className="absolute inset-0 border border-stone-200/40 rounded-2xl pointer-events-none"></div>
      ) : (
        <div className="absolute inset-0 border border-amber-500/5 rounded-2xl pointer-events-none"></div>
      )}

      {/* SVG Canvas for drawing score */}
      <div 
        ref={containerRef} 
        className={`w-full relative min-h-[360px] rounded-xl flex items-center justify-center p-2 overflow-x-auto scrollbar-none transition-colors duration-300 ${
          isPaperTheme 
            ? 'bg-[#faf9f6] border border-[#ebe7dd]' 
            : 'bg-[#0c121e]/80 border border-[#141b27]'
        }`}
      >
        <svg 
          viewBox="0 0 1000 370" 
          width="100%" 
          height="100%" 
          className="overflow-visible"
        >
          {/* Definitions for templates and filters */}
          <defs>
            {/* Ambient note glow */}
            <filter id="active-note-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feColorMatrix type="matrix" values="
                1 0 0 0 1
                0 0.68 0 0 0.68
                0 0 0.3 0 0.3
                0 0 0 1 0
              " />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Scanning line flare */}
            <filter id="cursor-glow" x="-50%" width="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Treble Clef Graphic Template */}
            <g id="treble-clef" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M12 31c0 2-1 3-3 3-1 0-3-1-3-3s1.5-2.5 3-2.5 3 1.5 3 4c0 4-4 7.5-8 7.5S0 39 0 35c0-10 15-20 12-32C11 1 8 5 8 10c0 10-8 15-8 21s5 9 10.5 9c6 0 11.5-4.5 11.5-11.5s-4.5-12.5-9-12.5" />
              <circle cx="12" cy="2" r="1.5" fill="currentColor" />
            </g>

            {/* Sharp Sign Template */}
            <g id="sharp" stroke="currentColor" strokeWidth="1.6" fill="none" transform="scale(0.8)">
              <path d="M3 0v16 M8 0v16 M0 5h11 M0 11h11" />
            </g>
          </defs>

          {/* Sheet Music Title block aligned exactly like classical papers */}
          <text 
            x="500" 
            y="30" 
            textAnchor="middle" 
            fill={isPaperTheme ? '#1c1917' : '#ffad4d'} 
            fontSize="17" 
            fontWeight="bold" 
            fontFamily="Georgia, serif"
            letterSpacing="1.2"
          >
            {scoreTitle}
          </text>
          <text 
            x="980" 
            y="56" 
            textAnchor="end" 
            fill={isPaperTheme ? '#57534e' : '#8295b2'} 
            fontSize="12" 
            fontFamily="Georgia, serif"
            fontStyle="italic"
          >
            {scoreArtist}
          </text>
          <text 
            x="80" 
            y="56" 
            textAnchor="start" 
            fill={isPaperTheme ? '#57534e' : '#8295b2'} 
            fontSize="10" 
            fontFamily="monospace"
          >
            {`Tempo: ♩ = ${song.tempo} | Key: ${song.key}`}
          </text>

          {/* Staves Drawing Loop */}
          {staffRanges.map((range, index) => {
            const staffY = TOP_PADDING + index * (STAFF_HEIGHT + STAFF_SPACING);
            const isActiveStaff = cursorInfo.activeIndex === index;
            const xStart = STAFF_X_START + (index === 0 ? 95 : 80);
            const xEnd = 980;

            // Find measures that fall on this staff range
            const staffMeasures = [];
            let mTime = measureDuration;
            let measureIndex = 2; // Measure 1 is at the very start
            while (mTime < song.duration) {
              if (mTime > range.start && mTime < range.end) {
                staffMeasures.push({ time: mTime, index: measureIndex });
              }
              mTime += measureDuration;
              measureIndex++;
            }

            return (
              <g key={range.index} id={`staff-${range.index}`}>
                {/* 5 Staff lines */}
                {Array.from({ length: 5 }).map((_, lineIdx) => {
                  const lineY = staffY + lineIdx * LINE_STEP;
                  return (
                    <line
                      key={lineIdx}
                      x1={STAFF_X_START}
                      y1={lineY}
                      x2="980"
                      y2={lineY}
                      stroke={
                        isPaperTheme 
                          ? '#2a2724' 
                          : (isActiveStaff ? '#1e2c42' : '#111b29')
                      }
                      strokeWidth={isPaperTheme ? '1.1' : '1.5'}
                    />
                  );
                })}

                {/* Left boundary line */}
                <line
                  x1={STAFF_X_START}
                  y1={staffY}
                  x2={STAFF_X_START}
                  y2={staffY + STAFF_HEIGHT}
                  stroke={isPaperTheme ? '#1c1917' : '#202f47'}
                  strokeWidth="2"
                />

                {/* Right boundary line */}
                <line
                  x1="980"
                  y1={staffY}
                  x2="980"
                  y2={staffY + STAFF_HEIGHT}
                  stroke={isPaperTheme ? '#1c1917' : '#202f47'}
                  strokeWidth="2"
                />

                {/* Treble Clef placement */}
                <use 
                  href="#treble-clef" 
                  x={STAFF_X_START + 10} 
                  y={staffY - 14} 
                  color={isPaperTheme ? '#1c1917' : '#5d6e87'} 
                  opacity={isActiveStaff ? 1 : 0.4} 
                />

                {/* Sharps for Key Signature */}
                {numSharps >= 1 && <use href="#sharp" x={STAFF_X_START + 35} y={staffY - 5} color={isPaperTheme ? '#2a2420' : '#485871'} opacity={isActiveStaff ? 1 : 0.5} />}
                {numSharps >= 2 && <use href="#sharp" x={STAFF_X_START + 43} y={staffY + 10} color={isPaperTheme ? '#2a2420' : '#485871'} opacity={isActiveStaff ? 1 : 0.5} />}
                {numSharps >= 3 && <use href="#sharp" x={STAFF_X_START + 51} y={staffY - 12} color={isPaperTheme ? '#2a2420' : '#485871'} opacity={isActiveStaff ? 1 : 0.5} />}
                {numSharps >= 4 && <use href="#sharp" x={STAFF_X_START + 59} y={staffY + 3} color={isPaperTheme ? '#2a2420' : '#485871'} opacity={isActiveStaff ? 1 : 0.5} />}

                {/* Time Signature on Staff 0 only */}
                {index === 0 && (
                  <g 
                    transform={`translate(${STAFF_X_START + 72}, ${staffY + 20})`} 
                    fill={isPaperTheme ? '#1c1917' : '#5d6e87'} 
                    opacity={isActiveStaff ? 1 : 0.6} 
                    fontWeight="bold" 
                    fontFamily="Georgia, serif" 
                    fontSize="20"
                  >
                    <text x="0" y="-7" textAnchor="middle">{beatsPerMeasure}</text>
                    <text x="0" y="9" textAnchor="middle">{song.timeSignature?.split('/')[1] || '4'}</text>
                  </g>
                )}

                {/* Measure Bar Lines & Numbering */}
                {staffMeasures.map((m, mIdx) => {
                  const elapsed = m.time - range.start;
                  const durationOnStaff = range.end - range.start;
                  const barX = xStart + (elapsed / durationOnStaff) * (xEnd - xStart);
                  return (
                    <g key={mIdx}>
                      <line
                        x1={barX}
                        y1={staffY}
                        x2={barX}
                        y2={staffY + STAFF_HEIGHT}
                        stroke={isPaperTheme ? '#bcaaa4' : '#1d2c3f'}
                        strokeWidth="1.2"
                      />
                      <text
                        x={barX}
                        y={staffY - 8}
                        fill={isPaperTheme ? '#8c857b' : '#4e5e78'}
                        fontSize="9.5"
                        fontFamily="Georgia, serif"
                        fontStyle="italic"
                        textAnchor="middle"
                      >
                        {m.index}
                      </text>
                    </g>
                  );
                })}

                {/* Starting measure number at the beginning of the staff */}
                <text
                  x={STAFF_X_START}
                  y={staffY - 8}
                  fill={isPaperTheme ? '#8c857b' : '#4e5e78'}
                  fontSize="10"
                  fontFamily="Georgia, serif"
                  fontWeight="bold"
                  fontStyle="italic"
                >
                  {Math.floor(range.start / measureDuration) + 1}
                </text>

                {/* Expression / dynamic marking symbols */}
                {index === 0 && (
                  <text 
                    x={xStart + 40} 
                    y={staffY - 14} 
                    fill={isPaperTheme ? '#1c1917' : '#ffad4d'} 
                    fontSize="11" 
                    fontWeight="bold" 
                    fontFamily="Georgia, serif"
                    fontStyle="italic"
                  >
                    {song.tempo > 75 ? 'Allegro' : 'Moderato'}
                  </text>
                )}
                {index === 0 && (
                  <text 
                    x={xStart + 50} 
                    y={staffY + STAFF_HEIGHT + 22} 
                    fill={isPaperTheme ? '#3a342c' : '#8295b2'} 
                    fontSize="12" 
                    fontWeight="bold"
                    fontFamily="Georgia, serif" 
                    fontStyle="italic"
                    className="opacity-80"
                  >
                    mp
                  </text>
                )}
                {index === 1 && (
                  <text 
                    x={xStart + 30} 
                    y={staffY + STAFF_HEIGHT + 22} 
                    fill={isPaperTheme ? '#3a342c' : '#8295b2'} 
                    fontSize="12" 
                    fontWeight="bold"
                    fontFamily="Georgia, serif" 
                    fontStyle="italic"
                    className="opacity-80"
                  >
                    mf
                  </text>
                )}

                {/* Notes Loop */}
                {song.notes
                  .filter(note => note.time >= range.start && note.time < range.end)
                  .map((note, noteIdx) => {
                    const durationOnThisStaff = range.end - range.start;
                    const elapsedOnThisStaff = note.time - range.start;
                    const noteX = xStart + (elapsedOnThisStaff / durationOnThisStaff) * (xEnd - xStart);

                    // Staff pitch mapping
                    const staffOffsetVal = PITCH_STAFF_OFFSET[note.pitch] !== undefined ? PITCH_STAFF_OFFSET[note.pitch] : 4;
                    const noteY = staffY + STAFF_HEIGHT - (staffOffsetVal - 2) * (LINE_STEP / 2);

                    // Check if note is currently playing
                    const isNoteActive = currentTime >= note.time && currentTime <= (note.time + note.duration);

                    // Note stem drawing (up or down depending on pitch)
                    const stemUp = staffOffsetVal < 6;
                    const stemHeight = 26;
                    const stemX = stemUp ? noteX + 6.5 : noteX - 6.5;
                    const stemY1 = noteY;
                    const stemY2 = stemUp ? noteY - stemHeight : noteY + stemHeight;

                    return (
                      <g 
                        key={noteIdx} 
                        className="cursor-pointer group/note"
                        onClick={() => onNoteClick && onNoteClick(note.pitch, note.frequency)}
                      >
                        {/* Hover bounding box */}
                        <circle cx={noteX} cy={noteY} r="16" fill="transparent" />

                        {/* Ledger lines overrides for low or high notes */}
                        {(staffOffsetVal <= 0 && staffOffsetVal % 2 === 0) && (
                          <line
                            x1={noteX - 12}
                            y1={noteY}
                            x2={noteX + 12}
                            y2={noteY}
                            stroke={isNoteActive ? (isPaperTheme ? '#d97706' : '#ffad4d') : (isPaperTheme ? '#3c3836' : '#30415a')}
                            strokeWidth="1.5"
                          />
                        )}
                        {(staffOffsetVal >= 12 && staffOffsetVal % 2 === 0) && (
                          <line
                            x1={noteX - 12}
                            y1={noteY}
                            x2={noteX + 12}
                            y2={noteY}
                            stroke={isNoteActive ? (isPaperTheme ? '#d97706' : '#ffad4d') : (isPaperTheme ? '#3c3836' : '#30415a')}
                            strokeWidth="1.5"
                          />
                        )}

                        {/* Note stem */}
                        <line
                          x1={stemX}
                          y1={stemY1}
                          x2={stemX}
                          y2={stemY2}
                          stroke={isNoteActive ? (isPaperTheme ? '#d97706' : '#ffad4d') : (isPaperTheme ? '#3c3836' : '#45566f')}
                          strokeWidth="1.5"
                        />

                        {/* Active note highlighter effect */}
                        {isNoteActive && (
                          isPaperTheme ? (
                            /* Warm yellow marker highlighter style */
                            <ellipse
                              cx={noteX}
                              cy={noteY}
                              rx="15"
                              ry="9"
                              fill="#fef08a"
                              opacity="0.85"
                            />
                          ) : (
                            <>
                              {/* Broad warm soft aura */}
                              <ellipse
                                cx={noteX}
                                cy={noteY}
                                rx="15"
                                ry="10"
                                fill="#ffad4d"
                                opacity="0.25"
                                filter="url(#active-note-glow)"
                              />
                              {/* Direct halo ring */}
                              <ellipse
                                cx={noteX}
                                cy={noteY}
                                rx="10"
                                ry="7.5"
                                fill="none"
                                stroke="#ffad4d"
                                strokeWidth="1.5"
                                className="animate-ping"
                                style={{ animationDuration: '1.2s' }}
                              />
                            </>
                          )
                        )}

                        {/* Oval Note Head */}
                        <ellipse
                          cx={noteX}
                          cy={noteY}
                          rx="7"
                          ry="4.5"
                          transform={`rotate(-22 ${noteX} ${noteY})`}
                          fill={isNoteActive ? (isPaperTheme ? '#b45309' : '#ffad4d') : (isPaperTheme ? '#1c1917' : '#23324c')}
                          stroke={isNoteActive ? (isPaperTheme ? '#d97706' : '#fff') : (isPaperTheme ? '#1c1917' : '#495a75')}
                          strokeWidth="1.5"
                          className="transition-colors duration-150"
                        />

                        {/* Traditional Vietnamese labels above note if provided */}
                        {note.vietName && (
                          <text
                            x={noteX}
                            y={noteY - (stemUp ? 32 : 18)}
                            textAnchor="middle"
                            fill={isNoteActive ? (isPaperTheme ? '#c2410c' : '#ffad4d') : (isPaperTheme ? '#6b6661' : '#576780')}
                            fontSize="9"
                            fontFamily="Georgia, serif"
                            fontWeight="bold"
                            className="capitalize"
                          >
                            {note.vietName}
                          </text>
                        )}

                        {/* Letter mapping bubble under note head */}
                        <text
                          x={noteX}
                          y={noteY + (stemUp ? 18 : 32)}
                          textAnchor="middle"
                          fill={isNoteActive ? (isPaperTheme ? '#7c2d12' : '#ffffff') : (isPaperTheme ? '#57534e' : '#4e5a70')}
                          fontSize="9.5"
                          fontWeight="bold"
                          className="font-mono scale-95"
                        >
                          {note.pitch}
                        </text>
                      </g>
                    );
                  })}

                {/* Floating vertical play scanner (glowing golden line from picture) */}
                {isActiveStaff && (
                  <g>
                    {isPaperTheme ? (
                      <>
                        {/* Classic red line playhead */}
                        <line
                          id="scanner-line"
                          x1={xStart + cursorInfo.percentWidth * (xEnd - xStart)}
                          y1={staffY - 18}
                          x2={xStart + cursorInfo.percentWidth * (xEnd - xStart)}
                          y2={staffY + STAFF_HEIGHT + 14}
                          stroke="#dc2626"
                          strokeWidth="1.6"
                          className="transition-all duration-100 ease-linear"
                        />
                        {/* Red triangle handle at top */}
                        <polygon
                          points={`
                            ${xStart + cursorInfo.percentWidth * (xEnd - xStart)},${staffY - 8}
                            ${xStart + cursorInfo.percentWidth * (xEnd - xStart) - 5},${staffY - 15}
                            ${xStart + cursorInfo.percentWidth * (xEnd - xStart) + 5},${staffY - 15}
                          `}
                          fill="#dc2626"
                        />
                      </>
                    ) : (
                      <>
                        {/* Futuristic synth glow playhead */}
                        <line
                          id="scanner-line"
                          x1={xStart + cursorInfo.percentWidth * (xEnd - xStart)}
                          y1={staffY - 15}
                          x2={xStart + cursorInfo.percentWidth * (xEnd - xStart)}
                          y2={staffY + STAFF_HEIGHT + 20}
                          stroke="url(#vertical-scanner-gradient)"
                          strokeWidth="2.5"
                          className="transition-all duration-100 ease-linear"
                          filter="url(#cursor-glow)"
                        />
                        {/* Glowing head bulb */}
                        <circle
                          cx={xStart + cursorInfo.percentWidth * (xEnd - xStart)}
                          cy={staffY - 15}
                          r="4"
                          fill="#ffb75e"
                          className="shadow-xl"
                        />
                      </>
                    )}
                  </g>
                )}
              </g>
            );
          })}

          {/* Linear Gradients definition for scanner */}
          <linearGradient id="vertical-scanner-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd000" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#ff9d00" stopOpacity="0.9" />
            <stop offset="85%" stopColor="#ff5100" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff5100" stopOpacity="0.0" />
          </linearGradient>
        </svg>
      </div>
    </div>
  );
}
