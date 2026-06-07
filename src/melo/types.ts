export interface Note {
  time: number;       // Start time in seconds
  duration: number;   // Duration in seconds
  pitch: string;      // English pitch notation, e.g., "C4", "C#4", "E4"
  frequency: number;  // Hertz frequency for audio synth
  vietName?: string;  // Traditional Vietnamese pitch name, e.g. "Hò", "Xự", "Xoang", "Cống"
  stringIndex?: number; // Target string or note index on interactive instruments
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  instrument: string;
  key: string;
  tempo: number;
  timeSignature: string;
  duration: number; // Total duration in seconds
  isAiGenerated: boolean;
  notes: Note[];
}

export type InstrumentType = 'piano' | 'dan_tranh' | 'dan_bau' | 'sao_truc' | 'guitar' | 'violin';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  tempo: number;
  isLooping: boolean;
  isMetronomeOn: boolean;
  isVisualizerOn: boolean;
  volume: number; // 0 to 1
}
