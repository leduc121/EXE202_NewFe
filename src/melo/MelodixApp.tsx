import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Settings, HelpCircle, X, Check, Award, AlertCircle, ArrowLeft } from 'lucide-react';
import { Song, InstrumentType } from './types';
import { songsData, PITCH_FREQ } from './songsData';
import { audioEngine } from './utils/AudioEngine';

// Custom subcomponents
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SheetMusic from './components/SheetMusic';
import PianoSimulator from './components/PianoSimulator';
import DanTranhSimulator from './components/DanTranhSimulator';
import DanBauSimulator from './components/DanBauSimulator';
import SaoTrucSimulator from './components/SaoTrucSimulator';
import StringInstrumentSimulator from './components/StringInstrumentSimulator';
import PlayerControls from './components/PlayerControls';
import Visualizer from './components/Visualizer';
import AIUploadModal from './components/AIUploadModal';

interface MelodixAppProps {
  onBack?: () => void;
  initialSong?: Song;
}

const getInstrumentTypeFromSong = (song?: Song): InstrumentType => {
  const instrument = song?.instrument.toLowerCase() || '';

  if (instrument.includes('tranh')) {
    return 'dan_tranh';
  }
  if (instrument.includes('bầu') || instrument.includes('bau') || instrument.includes('monochord')) {
    return 'dan_bau';
  }
  if (instrument.includes('sáo') || instrument.includes('sao') || instrument.includes('flute')) {
    return 'sao_truc';
  }
  if (instrument.includes('guitar')) {
    return 'guitar';
  }
  if (instrument.includes('violin')) {
    return 'violin';
  }

  return 'piano';
};

export default function MelodixApp({ onBack, initialSong }: MelodixAppProps) {
  // State elements
  const [activeInstrument, setActiveInstrument] = useState<InstrumentType>(
    getInstrumentTypeFromSong(initialSong)
  );
  const [activeSong, setActiveSong] = useState<Song>(initialSong || songsData[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isMetronome, setIsMetronome] = useState<boolean>(false);
  const [isVisualizer, setIsVisualizer] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);

  // Modal displays
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Time tracking scheduling reference
  const lastTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  // Synchronize synth master volume when volume slider moves
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  // Synchronize active song when initialSong is updated
  useEffect(() => {
    if (initialSong) {
      setActiveSong(initialSong);
      setCurrentTime(0);
      setIsPlaying(false);
      audioEngine.stopAll();

      setActiveInstrument(getInstrumentTypeFromSong(initialSong));
    }
  }, [initialSong]);

  // Synchronize active note triggering scheduler loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 40; // High precision tick speed
      lastTimeRef.current = performance.now();

      const tick = () => {
        const now = performance.now();
        const delta = (now - lastTimeRef.current) / 1000; // in seconds
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;

          // Event Scheduler: query notes starting in current interval [prev, next]
          const activeNotes = activeSong.notes.filter(
            (note) => note.time >= prev && note.time < next
          );

          activeNotes.forEach((note) => {
            // Synthesize note immediately on currently selected instrument!
            audioEngine.playNote(note.pitch, note.frequency, activeInstrument, note.duration, volume);
          });

          // Metronome Beat tick on subdivisions
          if (isMetronome && Math.floor(prev) !== Math.floor(next)) {
            // Tiny ticking pulse sound
            audioEngine.playNote('C6', PITCH_FREQ['C6'] * 1.5, 'sao_truc', 0.05, 0.15);
          }

          if (next >= activeSong.duration) {
            if (isLooping) {
              return 0; // Loop back
            } else {
              setIsPlaying(false);
              return activeSong.duration;
            }
          }
          return next;
        });

        timerRef.current = window.setTimeout(tick, intervalMs);
      };

      timerRef.current = window.setTimeout(tick, intervalMs);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, activeSong, activeInstrument, isLooping, isMetronome, volume]);

  // Switch the playback timbre only; never replace the user's transcribed song.
  const handleInstrumentChange = (inst: InstrumentType) => {
    setActiveInstrument(inst);
    setIsPlaying(false);
    audioEngine.stopAll();

    triggerToast(`Switched to Virtual ${inst.replace('_', ' ').toUpperCase()}`);
  };

  // Switch songs in sequence
  const handleNextSong = () => {
    audioEngine.stopAll();
    const currentIdx = songsData.findIndex((s) => s.id === activeSong.id);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % songsData.length : 0;
    const nextSong = songsData[nextIdx];
    setActiveSong(nextSong);
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveInstrument(getInstrumentTypeFromSong(nextSong));
  };

  const handlePrevSong = () => {
    audioEngine.stopAll();
    const currentIdx = songsData.findIndex((s) => s.id === activeSong.id);
    const prevIdx = currentIdx >= 0
      ? (currentIdx - 1 + songsData.length) % songsData.length
      : songsData.length - 1;
    const prevSong = songsData[prevIdx];
    setActiveSong(prevSong);
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveInstrument(getInstrumentTypeFromSong(prevSong));
  };

  // Complete file transcription callback
  const handleTranscriptionComplete = (newSong: Song) => {
    setActiveSong(newSong);
    setCurrentTime(0);
    audioEngine.stopAll();
    setActiveInstrument(getInstrumentTypeFromSong(newSong));

    triggerToast(`AI Transcription Complete: "${newSong.title}" loaded!`);
    setIsPlaying(true);
  };

  // Helper Toast notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Collect notes currently playing to pass down to active visual key highlighting
  const getActivePitches = (): string[] => {
    return activeSong.notes
      .filter((note) => currentTime >= note.time && currentTime <= (note.time + note.duration))
      .map((note) => note.pitch);
  };

  return (
    <div 
      id="app-workspace" 
      className="w-screen h-screen flex bg-[#03060c] text-white overflow-hidden relative font-sans leading-relaxed"
    >
      {/* Back to UniWave button */}
      {onBack && (
        <button
          onClick={() => {
            audioEngine.stopAll();
            onBack();
          }}
          className="fixed top-5 left-5 z-[60] flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#0c1220]/90 backdrop-blur-md border border-[#1c2c48] text-[#8e9bb3] hover:text-white hover:border-[#ffad4d]/40 text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer hover:shadow-[0_0_15px_rgba(255,173,77,0.15)] group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to UniWave
        </button>
      )}

      {/* Decorative ambient backdrop shapes mimicking picture aesthetics */}
      <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-gradient-to-b from-[#1c2c48]/15 to-[#03060c]/0 rounded-full filter blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-[20%] w-[40%] h-[30%] bg-gradient-to-t from-[#ffb570]/5 to-[#03060c]/0 rounded-full filter blur-[100px] pointer-events-none z-0"></div>

      {/* Main glass columns wrapper container */}
      <div className="relative w-full h-full flex z-10 m-0">
        
        {/* SIDEBAR ON LEFT */}
        <Sidebar
          activeInstrument={activeInstrument}
          onChangeInstrument={handleInstrumentChange}
          volume={volume}
          onVolumeChange={setVolume}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* WORK BENCH AREA FOR THE CORE SHEET + KEYS */}
        <div id="main-workbench" className="flex-1 h-full min-w-0 flex flex-col overflow-y-auto px-6 py-4 gap-4 scrollbar-thin">
          
          {/* TOP METADATA HEADER */}
          <Header
            activeSong={activeSong}
            onUploadClick={() => setIsUploadOpen(true)}
          />

          {/* DYNAMIC SCROLLER SHEET MUSIC */}
          <div className="flex-1 min-h-[380px] flex items-stretch">
            <SheetMusic
              song={activeSong}
              currentTime={currentTime}
              onNoteClick={(pitch, freq) => {
                audioEngine.playNote(pitch, freq, activeInstrument, 1.0, volume);
              }}
            />
          </div>

          {/* PLAYBACK CONTROLLER TIMELINE DECK */}
          <PlayerControls
            isPlaying={isPlaying}
            onPlayPause={() => {
              setIsPlaying(!isPlaying);
              audioEngine.resume();
            }}
            onNextSong={handleNextSong}
            onPrevSong={handlePrevSong}
            currentTime={currentTime}
            duration={activeSong.duration}
            onSeek={(t) => {
              setCurrentTime(t);
              audioEngine.stopAll();
            }}
            isLoop={isLooping}
            onToggleLoop={() => setIsLooping(!isLooping)}
            isMetronome={isMetronome}
            onToggleMetronome={() => setIsMetronome(!isMetronome)}
            isVisualizer={isVisualizer}
            onToggleVisualizer={() => setIsVisualizer(!isVisualizer)}
          />

          {/* INTERACTIVE PLAYBOARD FOR KEY VISUALS */}
          <div id="visual-play-deck" className="h-auto shrink-0">
            {activeInstrument === 'piano' && (
              <PianoSimulator
                activePitches={getActivePitches()}
                onKeyTrigger={(pitch, freq) => {
                  // Captured manual user key strike triggers
                }}
              />
            )}
            {activeInstrument === 'dan_tranh' && (
              <DanTranhSimulator
                activePitches={getActivePitches()}
                onKeyTrigger={(pitch, freq) => {
                  // Captured manual zither plucks
                }}
              />
            )}
            {activeInstrument === 'dan_bau' && (
              <DanBauSimulator
                activePitches={getActivePitches()}
                onKeyTrigger={(pitch, freq) => {
                  // Captured manual monochord slides
                }}
              />
            )}
            {activeInstrument === 'sao_truc' && (
              <SaoTrucSimulator
                activePitches={getActivePitches()}
                onKeyTrigger={(pitch, freq) => {
                  // Captured manual flute covers
                }}
              />
            )}
            {(activeInstrument === 'guitar' || activeInstrument === 'violin') && (
              <StringInstrumentSimulator
                instrument={activeInstrument}
                activePitches={getActivePitches()}
                onKeyTrigger={(pitch, freq) => {
                  // Captured manual string instrument triggers
                }}
              />
            )}
          </div>

          {/* COLOR WAVE SPECTRUM AT BOTTOM */}
          <Visualizer isPlaying={isPlaying} isVisualizerOn={isVisualizer} />

        </div>
      </div>

      {/* AI UPLOAD SLIDE TRANSCRIPTION DIALOG OVERLAY */}
      <AIUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onTranscriptionComplete={handleTranscriptionComplete}
      />

      {/* SETTINGS CARD DIALOG OVERLAY */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center select-none animate-fade-in">
          <div onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div id="settings-dialog" className="relative w-full max-w-[440px] bg-[#0c1220] border border-[#1c2c48] rounded-2xl p-6 shadow-2xl relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Simulator settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-md text-[#5d6e87] hover:text-white hover:bg-[#1a2b41]">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-[#8a9bb5]">Synth Instrument Latency</span>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 px-3 rounded-lg bg-[#ffad4d] text-black font-extrabold text-center">Low (Ultra-resp)</button>
                  <button className="flex-1 py-1.5 px-3 rounded-lg bg-[#14233a] text-[#8a9bb5] hover:text-white border border-[#1c2c48] font-bold text-center">Smooth Buffering</button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[#122033] pt-3">
                <span className="font-bold text-[#8a9bb5]">Fingering Guidance HUD</span>
                <div className="flex justify-between items-center bg-[#070b13] border border-[#162132] rounded-xl p-3">
                  <span className="text-[#adbcd7] font-semibold">Pitch and finger name tags</span>
                  <div className="w-8 h-4 bg-[#ffad4d] rounded-full relative flex items-center px-0.5 cursor-pointer">
                    <div className="w-3 h-3 bg-white rounded-full ml-auto"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[#122033] pt-3">
                <span className="font-bold text-[#8a9bb5]">Vietnamese Solfège Notations</span>
                <p className="text-[#5c6b84] leading-relaxed">
                  Tranditional instruments display both international pitches and traditional Sino-Vietnamese Solfège labels (<span className="text-[#ffad4d]">Hò, Xự, Sang, Xê, Cống</span>), offering direct translation.
                </p>
              </div>

              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="w-full mt-4 py-2 px-4 rounded-xl bg-gradient-to-r from-[#e37e19] to-[#bd4b1e] text-white font-bold tracking-wide"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOAT POPUP TOASTS */}
      {toastMessage && (
        <div id="app-toast-alert" className="fixed bottom-6 right-6 z-50 py-3 px-5 rounded-xl bg-[#0c1321] border border-[#ffad4d]/40 text-[#ffad4d] text-xs font-bold tracking-wide shadow-2xl flex items-center gap-2.5 animate-slide-in">
          <span className="w-2 h-2 rounded-full bg-[#ffad4d] animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
