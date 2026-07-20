const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  DB: 1,
  D: 2,
  'D#': 3,
  EB: 3,
  E: 4,
  F: 5,
  'F#': 6,
  GB: 6,
  G: 7,
  'G#': 8,
  AB: 8,
  A: 9,
  'A#': 10,
  BB: 10,
  B: 11,
};

export function pitchToMidi(pitch: string): number | null {
  const match = pitch.trim().toUpperCase().match(/^([A-G])([#B]?)(-?\d+)$/);
  if (!match) {
    return null;
  }

  const noteName = `${match[1]}${match[2]}`;
  const semitone = NOTE_TO_SEMITONE[noteName];
  const octave = Number(match[3]);

  if (semitone === undefined || Number.isNaN(octave)) {
    return null;
  }

  return (octave + 1) * 12 + semitone;
}

export function nearestPitch(pitch: string, candidates: string[]): string | null {
  const sourceMidi = pitchToMidi(pitch);
  if (sourceMidi === null || candidates.length === 0) {
    return candidates.includes(pitch) ? pitch : null;
  }

  return candidates.reduce((nearest, candidate) => {
    const nearestMidi = pitchToMidi(nearest);
    const candidateMidi = pitchToMidi(candidate);

    if (candidateMidi === null || nearestMidi === null) {
      return nearest;
    }

    const nearestDistance = Math.abs(sourceMidi - nearestMidi);
    const candidateDistance = Math.abs(sourceMidi - candidateMidi);

    return candidateDistance < nearestDistance ? candidate : nearest;
  }, candidates[0]);
}
