import { Song } from './types';

// Helper to get standard frequencies
export const PITCH_FREQ: Record<string, number> = {
  'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50
};

export const songsData: Song[] = [
  {
    id: 'chopin_nocturne',
    title: 'Nocturne in C Sharp Minor',
    artist: 'Frédéric Chopin',
    instrument: 'Piano',
    key: 'C# Minor',
    tempo: 72,
    timeSignature: '4/4',
    duration: 32,
    isAiGenerated: true,
    notes: [
      // Melody
      { time: 0.5, duration: 0.8, pitch: 'G#4', frequency: PITCH_FREQ['G#4'] },
      { time: 1.5, duration: 0.8, pitch: 'G#4', frequency: PITCH_FREQ['G#4'] },
      { time: 2.5, duration: 1.2, pitch: 'G#4', frequency: PITCH_FREQ['G#4'] },
      { time: 3.8, duration: 0.4, pitch: 'A4', frequency: PITCH_FREQ['A4'] },
      { time: 4.3, duration: 1.2, pitch: 'G#4', frequency: PITCH_FREQ['G#4'] },
      { time: 5.6, duration: 0.4, pitch: 'F#4', frequency: PITCH_FREQ['F#4'] },
      { time: 6.1, duration: 1.2, pitch: 'G#4', frequency: PITCH_FREQ['G#4'] },
      { time: 7.4, duration: 0.4, pitch: 'E4', frequency: PITCH_FREQ['E4'] },
      { time: 7.9, duration: 1.0, pitch: 'C#4', frequency: PITCH_FREQ['C#4'] },
      { time: 9.0, duration: 0.6, pitch: 'D#4', frequency: PITCH_FREQ['D#4'] },
      { time: 9.7, duration: 1.2, pitch: 'C4', frequency: PITCH_FREQ['C4'] }, // B#3 as C4
      { time: 11.0, duration: 2.0, pitch: 'C#4', frequency: PITCH_FREQ['C#4'] },

      // Second Phrase
      { time: 13.5, duration: 0.8, pitch: 'G#4', frequency: PITCH_FREQ['G#4'] },
      { time: 14.5, duration: 0.8, pitch: 'C#5', frequency: PITCH_FREQ['C#5'] },
      { time: 15.4, duration: 1.0, pitch: 'E5', frequency: PITCH_FREQ['E5'] },
      { time: 16.5, duration: 0.4, pitch: 'D#5', frequency: PITCH_FREQ['D#5'] },
      { time: 17.0, duration: 1.2, pitch: 'C#5', frequency: PITCH_FREQ['C#5'] },
      { time: 18.3, duration: 0.4, pitch: 'B4', frequency: PITCH_FREQ['B4'] },
      { time: 18.8, duration: 1.2, pitch: 'C#5', frequency: PITCH_FREQ['C#5'] },
      { time: 20.1, duration: 0.4, pitch: 'A4', frequency: PITCH_FREQ['A4'] },
      { time: 20.6, duration: 1.4, pitch: 'G#4', frequency: PITCH_FREQ['G#4'] },
      { time: 22.1, duration: 0.6, pitch: 'F#4', frequency: PITCH_FREQ['F#4'] },
      { time: 22.8, duration: 0.6, pitch: 'E4', frequency: PITCH_FREQ['E4'] },
      { time: 23.5, duration: 0.6, pitch: 'D#4', frequency: PITCH_FREQ['D#4'] },
      { time: 24.2, duration: 2.2, pitch: 'C#4', frequency: PITCH_FREQ['C#4'] },

      // Accompaniment Chords (to sound full)
      { time: 0.5, duration: 2.5, pitch: 'C#3', frequency: PITCH_FREQ['C#3'] },
      { time: 0.5, duration: 2.5, pitch: 'G#3', frequency: PITCH_FREQ['G#3'] },
      { time: 3.5, duration: 2.5, pitch: 'C#3', frequency: PITCH_FREQ['C#3'] },
      { time: 3.5, duration: 2.5, pitch: 'E3', frequency: PITCH_FREQ['E3'] },
      { time: 6.1, duration: 2.5, pitch: 'F#3', frequency: PITCH_FREQ['F#3'] },
      { time: 7.9, duration: 2.5, pitch: 'G#3', frequency: PITCH_FREQ['G#3'] },
      { time: 11.0, duration: 2.5, pitch: 'C#3', frequency: PITCH_FREQ['C#3'] },
      { time: 11.0, duration: 2.5, pitch: 'E3', frequency: PITCH_FREQ['E3'] },

      { time: 13.5, duration: 2.5, pitch: 'C#3', frequency: PITCH_FREQ['C#3'] },
      { time: 13.5, duration: 2.5, pitch: 'G#3', frequency: PITCH_FREQ['G#3'] },
      { time: 16.5, duration: 2.5, pitch: 'F#3', frequency: PITCH_FREQ['F#3'] },
      { time: 18.8, duration: 2.5, pitch: 'A3', frequency: PITCH_FREQ['A3'] },
      { time: 20.6, duration: 2.5, pitch: 'G#3', frequency: PITCH_FREQ['G#3'] },
      { time: 24.2, duration: 2.5, pitch: 'C#3', frequency: PITCH_FREQ['C#3'] }
    ]
  },
  {
    id: 'beo_dat_may_troi',
    title: 'Bèo Dạt Mây Trôi',
    artist: 'Traditional Vietnamese',
    instrument: 'Đàn Tranh',
    key: 'C Major',
    tempo: 65,
    timeSignature: '4/4',
    duration: 28,
    isAiGenerated: true,
    notes: [
      // Melody
      { time: 0.5, duration: 0.6, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 7 },
      { time: 1.2, duration: 0.6, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 8 },
      { time: 1.8, duration: 0.6, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 7 },
      { time: 2.4, duration: 0.6, pitch: 'E4', frequency: PITCH_FREQ['E4'], vietName: 'Mơ', stringIndex: 5 },
      { time: 3.0, duration: 1.2, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 7 },
      { time: 4.3, duration: 0.5, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 8 },
      { time: 4.9, duration: 0.8, pitch: 'C5', frequency: PITCH_FREQ['C5'], vietName: 'Líu', stringIndex: 10 },
      { time: 5.8, duration: 0.5, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 8 },
      { time: 6.4, duration: 0.6, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 7 },
      { time: 7.1, duration: 0.5, pitch: 'E4', frequency: PITCH_FREQ['E4'], vietName: 'Mơ', stringIndex: 5 },
      { time: 7.7, duration: 1.5, pitch: 'D4', frequency: PITCH_FREQ['D4'], vietName: 'Xự', stringIndex: 3 },
      
      { time: 9.5, duration: 0.6, pitch: 'D4', frequency: PITCH_FREQ['D4'], vietName: 'Xự', stringIndex: 3 },
      { time: 10.2, duration: 0.6, pitch: 'E4', frequency: PITCH_FREQ['E4'], vietName: 'Mơ', stringIndex: 5 },
      { time: 10.9, duration: 0.6, pitch: 'D4', frequency: PITCH_FREQ['D4'], vietName: 'Xự', stringIndex: 3 },
      { time: 11.6, duration: 0.6, pitch: 'C4', frequency: PITCH_FREQ['C4'], vietName: 'Hò', stringIndex: 1 },
      { time: 12.2, duration: 1.2, pitch: 'D4', frequency: PITCH_FREQ['D4'], vietName: 'Xự', stringIndex: 3 },
      { time: 13.5, duration: 0.5, pitch: 'E4', frequency: PITCH_FREQ['E4'], vietName: 'Mơ', stringIndex: 5 },
      { time: 14.1, duration: 0.8, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 7 },
      { time: 15.0, duration: 0.5, pitch: 'E4', frequency: PITCH_FREQ['E4'], vietName: 'Mơ', stringIndex: 5 },
      { time: 15.6, duration: 0.6, pitch: 'D4', frequency: PITCH_FREQ['D4'], vietName: 'Xự', stringIndex: 3 },
      { time: 16.3, duration: 0.5, pitch: 'C4', frequency: PITCH_FREQ['C4'], vietName: 'Hò', stringIndex: 1 },
      { time: 16.9, duration: 1.8, pitch: 'A3', frequency: PITCH_FREQ['A3'], vietName: 'Xự trầm', stringIndex: 0 },

      // Accompaniment plucks
      { time: 0.5, duration: 1.0, pitch: 'C3', frequency: PITCH_FREQ['C3'], stringIndex: 1 },
      { time: 3.0, duration: 1.0, pitch: 'G3', frequency: PITCH_FREQ['G3'], stringIndex: 4 },
      { time: 4.9, duration: 1.0, pitch: 'C4', frequency: PITCH_FREQ['C4'], stringIndex: 6 },
      { time: 7.7, duration: 1.0, pitch: 'G3', frequency: PITCH_FREQ['G3'], stringIndex: 4 },
      { time: 12.2, duration: 1.0, pitch: 'D3', frequency: PITCH_FREQ['D3'], stringIndex: 2 }
    ]
  },
  {
    id: 'inh_la_oi',
    title: 'Inh Lả Ơi',
    artist: 'Traditional Northwest',
    instrument: 'Sáo Trúc',
    key: 'G Major',
    tempo: 80,
    timeSignature: '2/4',
    duration: 18,
    isAiGenerated: true,
    notes: [
      { time: 0.5, duration: 0.4, pitch: 'C5', frequency: PITCH_FREQ['C5'], vietName: 'Hò', stringIndex: 0 },
      { time: 1.0, duration: 0.4, pitch: 'D5', frequency: PITCH_FREQ['D5'], vietName: 'Xự', stringIndex: 1 },
      { time: 1.5, duration: 0.4, pitch: 'C5', frequency: PITCH_FREQ['C5'], vietName: 'Hò', stringIndex: 0 },
      { time: 2.0, duration: 0.4, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 3 },
      { time: 2.5, duration: 0.8, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 4 },
      { time: 3.4, duration: 0.4, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 3 },
      { time: 3.9, duration: 1.2, pitch: 'C5', frequency: PITCH_FREQ['C5'], vietName: 'Hò', stringIndex: 0 },

      { time: 5.2, duration: 0.4, pitch: 'D5', frequency: PITCH_FREQ['D5'], vietName: 'Xự', stringIndex: 1 },
      { time: 5.7, duration: 0.4, pitch: 'E5', frequency: PITCH_FREQ['E5'], vietName: 'Mơ', stringIndex: 2 },
      { time: 6.2, duration: 0.4, pitch: 'D5', frequency: PITCH_FREQ['D5'], vietName: 'Xự', stringIndex: 1 },
      { time: 6.7, duration: 0.4, pitch: 'C5', frequency: PITCH_FREQ['C5'], vietName: 'Hò', stringIndex: 0 },
      { time: 7.2, duration: 0.8, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 3 },
      { time: 8.1, duration: 0.4, pitch: 'C5', frequency: PITCH_FREQ['C5'], vietName: 'Hò', stringIndex: 0 },
      { time: 8.6, duration: 1.2, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 4 },

      { time: 10.0, duration: 0.4, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 4 },
      { time: 10.5, duration: 0.4, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 3 },
      { time: 11.0, duration: 0.4, pitch: 'C5', frequency: PITCH_FREQ['C5'], vietName: 'Hò', stringIndex: 0 },
      { time: 11.5, duration: 0.4, pitch: 'A4', frequency: PITCH_FREQ['A4'], vietName: 'Cống', stringIndex: 3 },
      { time: 12.0, duration: 0.8, pitch: 'G4', frequency: PITCH_FREQ['G4'], vietName: 'Xê', stringIndex: 4 },
      { time: 12.9, duration: 0.4, pitch: 'E4', frequency: PITCH_FREQ['E4'], vietName: 'Sự', stringIndex: 5 },
      { time: 13.4, duration: 1.2, pitch: 'D4', frequency: PITCH_FREQ['D4'], vietName: 'Hò', stringIndex: 6 }
    ]
  }
];
