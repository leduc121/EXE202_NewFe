import type { Note, Song } from '../melo/types';
import { PITCH_FREQ } from '../melo/songsData';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

type MidiNoteEvent = {
  pitch: number;
  startTick: number;
  endTick: number;
};

class MidiReader {
  private offset = 0;

  constructor(private readonly view: DataView) {}

  get position() {
    return this.offset;
  }

  get byteLength() {
    return this.view.byteLength;
  }

  set position(value: number) {
    this.offset = value;
  }

  readUint8() {
    return this.view.getUint8(this.offset++);
  }

  readUint16() {
    const value = this.view.getUint16(this.offset, false);
    this.offset += 2;
    return value;
  }

  readUint32() {
    const value = this.view.getUint32(this.offset, false);
    this.offset += 4;
    return value;
  }

  readString(length: number) {
    let value = '';
    for (let i = 0; i < length; i += 1) {
      value += String.fromCharCode(this.readUint8());
    }
    return value;
  }

  skip(length: number) {
    this.offset += length;
  }

  readVarInt() {
    let value = 0;
    for (let i = 0; i < 4; i += 1) {
      const byte = this.readUint8();
      value = (value << 7) | (byte & 0x7f);
      if ((byte & 0x80) === 0) break;
    }
    return value;
  }
}

function midiPitchName(midiPitch: number) {
  const octave = Math.floor(midiPitch / 12) - 1;
  return `${NOTE_NAMES[midiPitch % 12]}${octave}`;
}

function midiFrequency(midiPitch: number) {
  const pitch = midiPitchName(midiPitch);
  return PITCH_FREQ[pitch] || 440 * 2 ** ((midiPitch - 69) / 12);
}

export function parseMidiToSong(buffer: ArrayBuffer, title: string, instrument = 'Piano'): Song {
  const reader = new MidiReader(new DataView(buffer));
  if (reader.readString(4) !== 'MThd') {
    throw new Error('Invalid MIDI file');
  }

  const headerLength = reader.readUint32();
  reader.readUint16();
  const trackCount = reader.readUint16();
  const ticksPerQuarter = reader.readUint16();
  if (headerLength > 6) reader.skip(headerLength - 6);

  const noteEvents: MidiNoteEvent[] = [];
  const tempoMap = [{ tick: 0, microsecondsPerQuarter: 500000 }];

  for (let trackIndex = 0; trackIndex < trackCount && reader.position < reader.byteLength; trackIndex += 1) {
    const chunkType = reader.readString(4);
    const chunkLength = reader.readUint32();
    const trackEnd = reader.position + chunkLength;
    if (chunkType !== 'MTrk') {
      reader.position = trackEnd;
      continue;
    }

    let tick = 0;
    let runningStatus = 0;
    const activeNotes = new Map<string, number[]>();

    while (reader.position < trackEnd) {
      tick += reader.readVarInt();
      let status = reader.readUint8();

      if (status < 0x80) {
        reader.position -= 1;
        status = runningStatus;
      } else {
        runningStatus = status;
      }

      if (status === 0xff) {
        const metaType = reader.readUint8();
        const length = reader.readVarInt();
        if (metaType === 0x51 && length === 3) {
          const value = (reader.readUint8() << 16) | (reader.readUint8() << 8) | reader.readUint8();
          tempoMap.push({ tick, microsecondsPerQuarter: value });
        } else {
          reader.skip(length);
        }
        continue;
      }

      if (status === 0xf0 || status === 0xf7) {
        reader.skip(reader.readVarInt());
        continue;
      }

      const command = status & 0xf0;
      const channel = status & 0x0f;
      const data1 = reader.readUint8();
      const needsSecondByte = command !== 0xc0 && command !== 0xd0;
      const data2 = needsSecondByte ? reader.readUint8() : 0;

      if (command === 0x90 && data2 > 0) {
        const key = `${channel}:${data1}`;
        const starts = activeNotes.get(key) || [];
        starts.push(tick);
        activeNotes.set(key, starts);
      } else if (command === 0x80 || (command === 0x90 && data2 === 0)) {
        const key = `${channel}:${data1}`;
        const starts = activeNotes.get(key);
        const startTick = starts?.shift();
        if (startTick !== undefined && tick > startTick) {
          noteEvents.push({ pitch: data1, startTick, endTick: tick });
        }
      }
    }

    reader.position = trackEnd;
  }

  tempoMap.sort((a, b) => a.tick - b.tick);

  const ticksToSeconds = (targetTick: number) => {
    let seconds = 0;
    let lastTick = 0;
    let tempo = tempoMap[0].microsecondsPerQuarter;

    for (let i = 1; i < tempoMap.length && tempoMap[i].tick <= targetTick; i += 1) {
      seconds += ((tempoMap[i].tick - lastTick) * tempo) / ticksPerQuarter / 1000000;
      lastTick = tempoMap[i].tick;
      tempo = tempoMap[i].microsecondsPerQuarter;
    }

    seconds += ((targetTick - lastTick) * tempo) / ticksPerQuarter / 1000000;
    return seconds;
  };

  const notes: Note[] = noteEvents
    .map((event, index) => {
      const time = ticksToSeconds(event.startTick);
      const end = ticksToSeconds(event.endTick);
      return {
        time,
        duration: Math.max(0.08, end - time),
        pitch: midiPitchName(event.pitch),
        frequency: midiFrequency(event.pitch),
        stringIndex: index % 16,
      };
    })
    .sort((a, b) => a.time - b.time)
    .slice(0, 600);

  const duration = notes.reduce((max, note) => Math.max(max, note.time + note.duration), 0);
  const firstTempo = tempoMap[0]?.microsecondsPerQuarter || 500000;

  return {
    id: `ai_transcribed_${Date.now()}`,
    title,
    artist: 'AI Transcribed',
    instrument,
    key: 'C Major',
    tempo: Math.round(60000000 / firstTempo),
    timeSignature: '4/4',
    duration: Math.max(duration, 8),
    isAiGenerated: true,
    notes,
  };
}
