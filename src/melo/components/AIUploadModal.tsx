import React, { useState } from 'react';
import { Upload, X, Check, Loader2, AlertCircle, FileAudio, FileMusic } from 'lucide-react';
import { Song } from '../types';
import { songsData } from '../songsData';

interface AIUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptionComplete: (song: Song) => void;
}

export default function AIUploadModal({ isOpen, onClose, onTranscriptionComplete }: AIUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const dragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const dropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Triggers simulated transcription logs sequentially
  const startTranscription = (targetPreset?: Song) => {
    setIsTranscribing(true);
    setProgressLog([]);
    setActiveStep(1);

    const logs = [
      'Initializing Melodix AI Music Model...',
      'Deep-scanning audio waveform spectrum...',
      'Identifying instrument harmonics & overtones...',
      'Transcribing notes & estimating temporal grid...',
      'Synthesizing pitch signature ledgers...',
      'Calibrating virtual playboards & Vietnamese notations...',
      'Fitted successfully: Sheet Music Ready!'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setProgressLog((prev) => [...prev, `[${(index * 0.7).toFixed(1)}s] ${log}`]);
        setActiveStep(index + 1);

        if (index === logs.length - 1) {
          setTimeout(() => {
            setIsTranscribing(false);
            // Select preset or fallback
            const finalSong = targetPreset || songsData[Math.floor(Math.random() * songsData.length)];
            onTranscriptionComplete(finalSong);
            setFile(null);
            setPromptInput('');
            onClose();
          }, 800);
        }
      }, (index + 1) * 750);
    });
  };

  return (
    <div id="ai-upload-modal-container" className="fixed inset-0 z-50 flex items-center justify-center select-none">
      {/* Dark Overlay glass */}
      <div 
        id="ai-modal-backdrop" 
        onClick={() => !isTranscribing && onClose()} 
        className="absolute inset-0 bg-[#040810]/85 backdrop-blur-md cursor-default"
      ></div>

      {/* Modal Frame matching golden screenshot theme */}
      <div 
        id="ai-modal-box" 
        className="relative w-full max-w-[560px] mx-4 bg-[#0a111a] border border-[#ffad4d]/20 rounded-2xl p-6 shadow-2xl relative z-10 flex flex-col items-stretch overflow-hidden"
      >
        {/* Glowing header light bulb details */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#ffad4d]/10 rounded-full filter blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white font-sans tracking-tight mb-0">
              AI Audio to Sheet Music
            </h2>
          </div>
          {!isTranscribing && (
            <button 
              onClick={onClose} 
              id="btn-ai-modal-close" 
              className="p-1.5 rounded-lg text-[#556782] hover:text-white hover:bg-[#1a2b41] transition-transform cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body content */}
        {!isTranscribing ? (
          <div className="flex flex-col gap-5 relative z-10">
            {/* Drag Zone */}
            <div
              id="ai-dropzone"
              onDragOver={dragOverHandler}
              onDrop={dropHandler}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                file 
                  ? 'border-[#ffad4d] bg-[#1c1915]/30' 
                  : 'border-[#1b2f48] hover:border-[#38567c] bg-[#0c1320]/50'
              }`}
            >
              <input
                id="file-upload-input"
                type="file"
                accept="audio/*, .mid, .midi"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
                {file ? (
                  <>
                    <FileAudio className="w-12 h-12 text-[#ffad4d] mb-3 animate-bounce" />
                    <span className="text-sm font-semibold text-white mb-1 truncate max-w-[320px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-[#52637f] font-mono">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to transcribe
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-[#38557b] mb-3 group-hover:text-[#ffad4d] transition-colors" />
                    <span className="text-sm font-bold text-[#b5c7e1] mb-1">
                      Drag & Drop Audio / MIDI
                    </span>
                    <span className="text-xs text-[#52637f] mb-4">
                      Supports MP3, WAV, or MIDI files
                    </span>
                    <span className="py-2 px-5 rounded-lg bg-[#142337] border border-[#1b3455] hover:border-[#ffad4d]/40 text-xs text-white font-bold transition-all">
                      Browse Files
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Prompt Tuning parameter context */}
            <div className="flex flex-col gap-2">
              <label htmlFor="ai-prompt-editor text-left" className="text-xs font-bold text-[#a0b0cc] tracking-wide text-left self-start">
                Transcription Instructions <span className="text-[#ffad4d]/60 font-normal">(Optional)</span>
              </label>
              <textarea
                id="ai-prompt-editor"
                placeholder="e.g. Optimize fingering layout for Đàn Tranh, increase tempo estimation accuracy, simplify chord sequences..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={2}
                className="w-full bg-[#080d15] border border-[#182a40] focus:border-[#ffad4d] rounded-xl text-xs text-white p-3.5 focus:outline-none transition-all placeholder:text-[#3e4d63]"
              />
            </div>

            {/* Simulated Action row or quick demos */}
            <div className="flex flex-col gap-2.5 border-t border-[#131f31] pt-4 mt-1">
              <span className="text-[10px] text-left text-[#4c5c75] font-bold tracking-widest uppercase mb-1">
                DEMO PRESET DEMANDS
              </span>
              <div className="grid grid-cols-3 gap-2">
                {songsData.map((song) => (
                  <button
                    key={song.id}
                    id={`demo-preset-${song.id}`}
                    onClick={() => startTranscription(song)}
                    className="flex flex-col items-center p-2.5 rounded-lg border border-[#14283f]/60 bg-[#08111e]/80 hover:bg-[#ffad4d]/5 hover:border-[#ffad4d]/40 text-center cursor-pointer transition-all duration-300 group"
                  >
                    <FileMusic className="w-5 h-5 text-[#425a7e] group-hover:text-[#ff9822] mb-1" />
                    <span className="text-[9.5px] font-bold text-[#8ba2c4] group-hover:text-white truncate w-full">
                      {song.title}
                    </span>
                    <span className="text-[8px] text-[#4d5c75] truncate w-full mt-0.5">
                      {song.artist.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => startTranscription()}
              id="btn-ai-modal-submit"
              disabled={!file}
              className={`w-full py-3 px-5 rounded-xl text-sm font-extrabold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                file
                  ? 'bg-gradient-to-r from-[#e37e19] to-[#bd4b1e] hover:shadow-[0_0_15px_rgba(255,173,77,0.4)] text-white'
                  : 'bg-[#121c2c] border border-[#18283e] text-[#4e5c72] cursor-not-allowed'
              }`}
            >
              <span>TRANSCRIBE SHEET WITH AI</span>
            </button>
          </div>
        ) : (
          /* Processing scan screens state log lists */
          <div className="flex flex-col items-center py-6 relative z-10">
            <Loader2 className="w-12 h-12 text-[#ffad4d] animate-spin mb-4" />
            <h3 className="text-sm font-bold text-white mb-1">
              Melodix AI Transcribing...
            </h3>
            <p className="text-xs text-[#52637f] mb-6">
              Decompressing spectral overtones to score ledgers
            </p>

            {/* Processing step bars progress visually */}
            <div className="w-full flex gap-1 mb-8">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    idx + 1 <= activeStep 
                      ? 'bg-gradient-to-r from-[#dca06b] to-[#ffad4d]' 
                      : 'bg-[#121d2e]'
                  }`}
                />
              ))}
            </div>

            {/* Log terminal listings */}
            <div className="w-full rounded-xl bg-[#03060b] border border-[#131f31] p-4 font-mono text-[10.5px] text-[#8e9faf] h-40 overflow-y-auto flex flex-col gap-1.5 scrollbar-none text-left">
              {progressLog.map((log, lIdx) => (
                <div key={lIdx} className="flex gap-2 items-start animate-fade-in">
                  <span className="text-[#ffad4d] font-bold shrink-0">✔</span>
                  <span>{log}</span>
                </div>
              ))}
              <div className="text-cyan-500 font-bold tracking-widest animate-pulse mt-1 shrink-0">
                ■ SCANNING AUDIO HARMONICS...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
