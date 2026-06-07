import { InstrumentType } from '../types';

export interface ActiveNote {
  oscillators: (OscillatorNode | BiquadFilterNode | ConstantSourceNode | AudioBufferSourceNode | GainNode)[];
  gainNode: GainNode;
  pitch: string;
  stop: () => void;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNotes: Map<string, ActiveNote> = new Map();
  private isMuted: boolean = false;

  constructor() {
    // Initialized lazily on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
    }
  }

  public setVolume(volume: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Plays a note with a predefined duration
  public playNote(
    pitch: string,
    frequency: number,
    instrument: InstrumentType,
    duration: number,
    volume: number = 0.8
  ) {
    this.init();
    this.resume();

    if (!this.ctx || !this.masterGain) return;

    const note = this.startNote(pitch, frequency, instrument, volume);
    if (note) {
      setTimeout(() => {
        note.stop();
      }, duration * 1000);
    }
  }

  // Starts a continuous note (for key hold, zither pluck, or scroll tracking)
  public startNote(
    pitch: string,
    frequency: number,
    instrument: InstrumentType,
    volume: number = 0.8
  ): ActiveNote | null {
    this.init();
    this.resume();

    if (!this.ctx || !this.masterGain) return null;

    // Avoid duplicate notes for the same pitch
    const key = `${instrument}_${pitch}`;
    if (this.activeNotes.has(key)) {
      this.activeNotes.get(key)?.stop();
    }

    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.connect(this.masterGain);

    const oscillators: any[] = [];

    if (instrument === 'dan_bau') {
      // Find if there is an existing active dan_bau note for monophonic slide (portamento)
      let existingKey: string | null = null;
      for (const k of this.activeNotes.keys()) {
        if (k.startsWith('dan_bau_')) {
          existingKey = k;
          break;
        }
      }

      if (existingKey) {
        const activeNote = this.activeNotes.get(existingKey);
        this.activeNotes.delete(existingKey);
        
        if (activeNote && this.ctx) {
          const now = this.ctx.currentTime;
          
          // Locate the main oscillator and vibrato gain node
          const oscNode = activeNote.oscillators.find(o => o instanceof OscillatorNode && o.type === 'sawtooth') as OscillatorNode;
          const vibratoGainNode = activeNote.oscillators.find(o => o instanceof GainNode && o !== activeNote.gainNode) as GainNode;
          
          if (oscNode) {
            oscNode.frequency.cancelScheduledValues(now);
            oscNode.frequency.setValueAtTime(oscNode.frequency.value, now);
            oscNode.frequency.exponentialRampToValueAtTime(frequency, now + 0.18);
            
            if (vibratoGainNode) {
              vibratoGainNode.gain.cancelScheduledValues(now);
              vibratoGainNode.gain.setValueAtTime(vibratoGainNode.gain.value, now);
              vibratoGainNode.gain.linearRampToValueAtTime(frequency * 0.02, now + 0.18);
            }
          }
          
          // Re-pluck monochord string envelope (rapid dip and rise)
          const gainNode = activeNote.gainNode;
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(gainNode.gain.value, now);
          gainNode.gain.linearRampToValueAtTime(volume * 0.1, now + 0.02);
          gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + 0.06);
          gainNode.gain.exponentialRampToValueAtTime(volume * 0.25, now + 1.2);
          
          const newKey = `dan_bau_${pitch}`;
          activeNote.pitch = pitch;
          
          const originalStop = activeNote.stop;
          activeNote.stop = () => {
            originalStop();
            this.activeNotes.delete(newKey);
          };
          
          this.activeNotes.set(newKey, activeNote);
          return activeNote;
        }
      }
    }

    if (instrument === 'piano') {
      // Piano: simulated hammer strike noise transient + multi-harmonic tone decay
      const hammer = this.ctx.createOscillator();
      hammer.type = 'sine';
      hammer.frequency.setValueAtTime(frequency * 6.5, now);
      const hammerGain = this.ctx.createGain();
      hammerGain.gain.setValueAtTime(volume * 0.4, now);
      hammerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      hammer.connect(hammerGain);
      hammerGain.connect(gainNode);
      hammer.start(now);
      oscillators.push(hammer, hammerGain);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2, now); // Octave

      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(frequency * 3, now); // 5th

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.exponentialRampToValueAtTime(1000, now + 1.0);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gainNode);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      oscillators.push(osc1, osc2, osc3, filter);

      // ADSR Envelope
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.08, now + 1.4);
    } 
    else if (instrument === 'violin') {
      // Violin: bowed sawtooth tone with slow bow attack and rich vibrato
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);

      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(frequency * 2, now); // octave overtone

      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.8, now); // Violin vibrato frequency
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(frequency * 0.015, now);

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibratoGain.connect(subOsc.frequency);
      vibrato.start(now);
      oscillators.push(vibrato, vibratoGain);

      // Lowpass filter to soften the harshness of the sawtooth wave
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gainNode);

      osc.start(now);
      subOsc.start(now);
      oscillators.push(osc, subOsc, filter);

      // Envelope: Bow stroke build-up
      gainNode.gain.linearRampToValueAtTime(volume * 0.65, now + 0.12);
      gainNode.gain.linearRampToValueAtTime(volume * 0.55, now + 0.4);
    }
    else if (instrument === 'dan_tranh') {
      // Đàn Tranh (Zither): bright steel string pluck with LFO vibrato delayed to simulate human press
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(frequency, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 3, now); // Metallic high overtone

      // Pitch vibrato (nhấn/rung) delayed by 220ms (highly authentic)
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(6.0, now);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(0, now);
      vibratoGain.gain.linearRampToValueAtTime(frequency * 0.015, now + 0.22); // Fade in

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);
      vibratoGain.connect(osc2.frequency);

      vibrato.start(now);
      oscillators.push(vibrato, vibratoGain);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4500, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);

      osc1.start(now);
      osc2.start(now);
      oscillators.push(osc1, osc2, filter);

      // Envelope: instant pluck, metallic ring decay
      gainNode.gain.linearRampToValueAtTime(volume * 0.95, now + 0.003);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.03, now + 0.8);
    }
    else if (instrument === 'guitar') {
      // Guitar: warm acoustic pluck, slow natural decay
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, now);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2, now); // Octave

      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(frequency, now);
      const osc3Gain = this.ctx.createGain();
      osc3Gain.gain.setValueAtTime(0.08, now); // Subtle buzz
      osc3.connect(osc3Gain);

      // Subtle vibrato LFO
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(4.2, now);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(frequency * 0.003, now);

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc1.frequency);
      vibratoGain.connect(osc2.frequency);
      vibrato.start(now);
      oscillators.push(vibrato, vibratoGain);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, now);
      filter.frequency.exponentialRampToValueAtTime(700, now + 0.8);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3Gain.connect(filter);
      filter.connect(gainNode);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      oscillators.push(osc1, osc2, osc3, osc3Gain, filter);

      // Envelope: instant pluck, organic acoustic decay
      gainNode.gain.linearRampToValueAtTime(volume * 0.85, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.04, now + 1.2);
    }
    else if (instrument === 'dan_bau') {
      // Đàn Bầu: single-string slide. Vocal formant bandpass filter + delayed vibrato (rung cần đàn bầu)
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);

      // Pitch vibrato delayed slightly for human touch
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(4.5, now);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(0, now);
      vibratoGain.gain.linearRampToValueAtTime(frequency * 0.02, now + 0.25); // Fade in

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(now);
      oscillators.push(vibrato, vibratoGain);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, now);
      filter.Q.setValueAtTime(5, now); // Vocal/formant chamber

      osc.connect(filter);
      filter.connect(gainNode);
      osc.start(now);
      oscillators.push(osc, filter);

      // Envelope: singing attack, long monochord resonance
      gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(volume * 0.25, now + 1.2);
    } 
    else if (instrument === 'sao_truc') {
      // Sáo Trúc: bamboo flute physical modeling using Sine + bandpass-filtered breath white noise
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      // 5.2Hz wind pressure vibrato/flutter
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.2, now);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(0, now);
      vibratoGain.gain.linearRampToValueAtTime(frequency * 0.012, now + 0.15); // Fade in

      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(now);
      oscillators.push(vibrato, vibratoGain);

      // Custom White Noise generation for realistic breath airflow sound
      const bufferSize = this.ctx.sampleRate * 1.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Bandpass filter to tune the noise to the flute's pitch
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(frequency, now);
      noiseFilter.Q.setValueAtTime(25, now); // Whistles resonance

      // Gain node for breath noise volume
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.06, now); // Breath noise ratio
      noiseGain.gain.exponentialRampToValueAtTime(volume * 0.03, now + 0.5);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(gainNode);

      noiseSource.start(now);
      oscillators.push(noiseSource, noiseFilter, noiseGain);

      osc.connect(gainNode);
      osc.start(now);
      oscillators.push(osc);

      // Envelope: gentle breath attack, steady sustain
      gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 0.08);
      gainNode.gain.linearRampToValueAtTime(volume * 0.6, now + 0.4);
    }

    const stop = () => {
      if (!this.ctx) return;
      const releaseTime = this.ctx.currentTime;
      try {
        // Release phase
        gainNode.gain.cancelScheduledValues(releaseTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, releaseTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, releaseTime + 0.3);

        // Schedule stopping the oscillators
        setTimeout(() => {
          oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
          });
          try { gainNode.disconnect(); } catch (e) {}
        }, 350);
      } catch (e) {
        // Safe fallback if audio state is in-flux
      }
      this.activeNotes.delete(key);
    };

    const activeNote: ActiveNote = {
      oscillators,
      gainNode,
      pitch,
      stop
    };

    this.activeNotes.set(key, activeNote);
    return activeNote;
  }

  // Stops all playing notes
  public stopAll() {
    this.activeNotes.forEach(note => note.stop());
    this.activeNotes.clear();
  }
}

export const audioEngine = new AudioEngine();
