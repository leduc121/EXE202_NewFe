import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { motion, useScroll } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, Disc, Timer, Feather, Target, BookOpen, Handshake, ShieldCheck, Upload, Music, Loader2, FileAudio, X as XIcon, CheckCircle2, FileText, Save, Share2, Download, UserCircle2, Settings, LogOut, LayoutDashboard } from 'lucide-react';
import logoUrl from '../assets/uniwave-logo.png';
import MelodixApp from './melo/MelodixApp';
import { songsData } from './melo/songsData';
import WaveformHero from './components/WaveformHero';
import AdminDashboard from './components/AdminDashboard';
import { api, type CurrentUser } from './lib/api';
import { getMarketingAttributionPayload, initializeAnalytics, trackEvent, trackPageView } from './lib/analytics';
import type { Song } from './melo/types';


const NAV_LINKS = ['Acoustics', 'Platters', 'Engine', 'Integrations', 'Contact'];
const VIDEO_SRC = 'https://res.cloudinary.com/dzhewohdo/video/upload/v1780067822/kling_20260529_Image_to_Video_Create_a_s_5676_0_nhmyll.mp4';

const HOW_STEPS = [
  {
    eyebrow: '001',
    title: 'Upload Your Music',
    description: 'Import any audio file, sample, or music link. UniWave accepts references, demos, and raw ideas.',
  },
  {
    eyebrow: '002',
    title: 'AI Transcription',
    description: 'Our audio model listens to rhythm, tone, and atmosphere, then turns your sound into clear creative direction.',
  },
  {
    eyebrow: '003',
    title: 'Start Creating',
    description: 'Follow the generated ideas, visuals, and session prompts to build music experiences instantly.',
  },
];

const FOOTER_LINK_GROUPS = [
  {
    title: 'Explore',
    links: ['Overview', 'Acoustics', 'Why UniWave'],
  },
  {
    title: 'What We Do',
    links: ['Products', 'Features', 'Sessions'],
  },
  {
    title: 'Contact',
    links: ['Start a project', 'Email us', 'Book a call'],
  },
  {
    title: 'Information',
    links: ['404', 'Privacy', 'Terms of Service'],
  },
];

const BENEFITS = [
  {
    icon: Timer,
    title: 'Faster Sound Direction',
    description: 'Move from a rough mood to a usable sonic concept without losing time in blank sessions.',
  },
  {
    icon: Feather,
    title: 'Mood-to-Music Flow',
    description: 'Translate emotion, texture, and atmosphere into prompts, playlists, and studio-ready ideas.',
  },
  {
    icon: Target,
    title: 'Focused Listening',
    description: 'Keep every recommendation aligned with your rhythm, genre, energy, and creative intent.',
  },
  {
    icon: BookOpen,
    title: 'Reference Intelligence',
    description: 'Understand tracks, instruments, and sonic references quickly so each decision feels clearer.',
  },
  {
    icon: Handshake,
    title: 'Studio Companion',
    description: 'A quiet creative partner that helps shape sessions whenever a melody or concept appears.',
  },
  {
    icon: ShieldCheck,
    title: 'Creative Control',
    description: 'Keep your uploads, references, and generated directions organized around your own workflow.',
  },
];

const PRICING_PLANS = [
  {
    name: 'Free',
    description: 'Start learning music with UniWave Studio using essential creative tools.',
    price: '0 VND',
    period: '/forever',
    features: [
      'Learn 3 basic instruments',
      'Access 10 sample tracks',
      'Community support',
    ],
    cta: 'Start Now',
  },
  {
    name: 'Artisan',
    description: 'Experience unlimited access to every feature in UniWave Studio.',
    price: '99,000 VND',
    period: '/month',
    features: [
      'Unlock all traditional instruments',
      'Unlimited premium track library',
      'AI performance skill analysis',
      'Lossless HD audio quality',
      'Priority support 24/7',
    ],
    cta: 'Choose This Plan',
    tag: 'MOST POPULAR',
    featured: true,
  },
  {
    name: 'Studio',
    description: 'Built for teachers and professional music creators.',
    price: '899,000 VND',
    period: '/year',
    features: [
      'Everything in the Artisan plan',
      'Save 25% compared with monthly billing',
      'Commercial rights for generated tracks',
      'MIDI & MusicXML export support',
      'Create virtual classes for students',
      '"Artisan" profile badge',
    ],
    cta: 'Choose This Plan',
  },
];

type PageView = 'home' | 'signup' | 'signin' | 'contact' | 'upload' | 'simulator' | 'admin';

const getPageFromHash = (): PageView => {
  if (typeof window === 'undefined') return 'home';
  if (window.location.pathname.endsWith('/admin')) return 'admin';
  const hash = window.location.hash.replace('#', '');
  if (hash.startsWith('admin')) return 'admin';
  if (hash === 'signup' || hash === 'signin' || hash === 'contact' || hash === 'upload' || hash === 'simulator') return hash;
  return 'home';
};

const CONTACT_CARDS = [
  {
    title: 'Email Us',
    description: "Send us a message and we'll get back to you within one business day.",
    action: 'uniwave06@gmail.com',
    href: 'mailto:uniwave06@gmail.com',
  },
  {
    title: 'Call Us',
    description: "Prefer to talk? Give us a call and let's discuss your next sound idea.",
    action: '+84 93 418 53 05',
    href: 'tel:+84934185305',
  },
  {
    title: 'Visit our studio',
    description: 'Stop by for a quick chat about your next immersive audio experience.',
    action: 'View on map',
    href: '#map',
  },
];

function ContactCards() {
  return (
    <section className="contact-card-section" id="contact">
      {CONTACT_CARDS.map((card, i) => (
        <motion.article
          key={card.title}
          className="contact-card"
          initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <h2>{card.title}</h2>
          <p>{card.description}</p>
          <a href={card.href}>
            {card.action}
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.article>
      ))}
    </section>
  );
}

function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="pricing-watermark" aria-hidden="true">Pricing</div>
      <div className="pricing-shell">
        <motion.div
          className="pricing-copy"
          initial={{ opacity: 0, y: 22, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.35 }}
        >
          <span>Pricing</span>
          <h2>Choose the plan that fits your music journey</h2>
        </motion.div>

        <div className="pricing-grid">
          {PRICING_PLANS.map((plan, i) => (
            <motion.article
              key={plan.name}
              className={`pricing-card ${plan.featured ? 'pricing-card-featured' : ''}`}
              initial={{ opacity: 0, y: 34, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.58, delay: i * 0.09, ease: 'easeOut' }}
              viewport={{ once: true, amount: 0.28 }}
            >
              {plan.tag && <div className="pricing-tag">{plan.tag}</div>}
              <div className="pricing-card-head">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className="pricing-price">
                <strong>{plan.price}</strong>
                <span>{plan.period}</span>
              </div>

              <a className="pricing-button" href="#signup">
                {plan.cta}
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <div className="pricing-feature-rule">
                <span>Features</span>
              </div>

              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check className="h-4 w-4" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthPage({ mode }: { mode: 'signup' | 'signin' }) {
  const isSignup = mode === 'signup';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setIsSubmitting(true);
    trackEvent('auth_submit', { method: 'email', auth_mode: mode });

    try {
      if (isSignup) {
        await api.register(
          fullName.trim() || email.split('@')[0],
          email.trim(),
          password,
          getMarketingAttributionPayload(),
        );
        setAuthMessage('Account created. Signing you in...');
        trackEvent('sign_up', { method: 'email' });
      }

      await api.login(email.trim(), password, getMarketingAttributionPayload());
      trackEvent('login', { method: 'email' });
      window.dispatchEvent(new Event('uniwave-auth-change'));
      setAuthMessage('Signed in successfully.');
      window.location.hash = '#upload';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      trackEvent('auth_error', { method: 'email', auth_mode: mode, error_message: message });
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <a className="auth-logo-link" href="#home" aria-label="Back to UniWave home">
        <img src={logoUrl} alt="UniWave" />
      </a>

      <motion.h1
        className="auth-heading"
        initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        Your journey<br />starts here.
      </motion.h1>

      <motion.form
        className="auth-form-card"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 38, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.16, ease: 'easeOut' }}
      >
        {isSignup && (
          <label>
            Name
            <input
              type="text"
              placeholder="Jane Smith"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            placeholder="jane@uniwave.audio"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            placeholder="password123"
            value={password}
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        {isSignup && (
          <>
            <label>
              Phone
              <input type="tel" placeholder="+1 555 55 55" />
            </label>

            <label>
              What can we help you with?
              <select defaultValue="">
                <option value="" disabled>Select...</option>
                <option>Generate music experiences</option>
                <option>Build a studio workflow</option>
                <option>Partner with UniWave</option>
              </select>
            </label>

            <label className="auth-policy-row">
              <input type="checkbox" />
              <span>By signing up you agree with our <a href="#privacy">Privacy Policy</a></span>
            </label>
          </>
        )}

        {authError && (
          <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{authError}</p>
        )}

        {authMessage && (
          <p style={{ color: '#16a34a', fontSize: '12px', margin: 0 }}>{authMessage}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connecting...' : isSignup ? 'Sign up' : 'Sign in'}
        </button>

        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <a href={isSignup ? '#signin' : '#signup'}>{isSignup ? ' Sign in' : ' Sign up'}</a>
        </p>
      </motion.form>

      <ContactCards />
    </main>
  );
}

function ContactPage() {
  return (
    <main className="auth-page contact-page">
      <a className="auth-logo-link" href="#home" aria-label="Back to UniWave home">
        <img src={logoUrl} alt="UniWave" />
      </a>
      <motion.h1
        className="auth-heading"
        initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        Keep in touch<br />with UniWave.
      </motion.h1>
      <ContactCards />
    </main>
  );
}

// ═══ ENTRANCE ANIMATION COMPONENT ═══
function EntranceAnimation({ onComplete, canProceed }: { onComplete: () => void; canProceed: boolean }) {
  const letters = 'UNIWAVE'.split('');

  return (
    <motion.div
      className="intro-curtain fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center overflow-hidden bg-[#111315] pointer-events-none"
      initial={{ y: '0%' }}
      animate={canProceed ? { y: '-100%' } : { y: '0%' }}
      transition={{
        delay: canProceed ? 0.35 : 0,
        duration: 1.05,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={() => canProceed && onComplete()}
    >
      <motion.div
        className="intro-logo relative flex items-center justify-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <motion.span
          className="intro-scan-glow"
          initial={{ opacity: 0, x: -64, scale: 0.7 }}
          animate={{ opacity: [0, 0.8, 0], x: [8, 160, 220], scale: [0.7, 1.2, 0.9] }}
          transition={{ delay: 0.55, duration: 1.05, ease: 'easeInOut' }}
        />

        {letters.map((letter, i) => (
          <motion.span
            key={letter + i}
            className="intro-logo-letter"
            initial={{
              opacity: 0,
              x: 24,
              filter: 'blur(14px)',
            }}
            animate={{
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
            }}
            transition={{
              delay: 0.18 + i * 0.11,
              duration: 0.52,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}



function UploadPage({ onTranscriptionComplete }: { onTranscriptionComplete: (song: Song) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'processing' | 'success'>('idle');
  const [uploadPercent, setUploadPercent] = useState(0);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [transcribedSong, setTranscribedSong] = useState<Song | null>(null);
  const [generatedSheetId, setGeneratedSheetId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  const dragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const dragLeaveHandler = () => {
    setIsDragging(false);
  };

  const dropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startTranscription = async () => {
    if (!file) return;
    if (!api.isAuthenticated()) {
      trackEvent('login_required', { feature: 'audio_upload' });
      setUploadError('Please sign in before uploading audio.');
      window.location.hash = '#signin';
      return;
    }

    setUploadError('');
    setProgressLog([]);
    setActiveStep(0);
    setPhase('uploading');
    setUploadPercent(0);
    trackEvent('audio_upload_start', {
      file_type: file.type || 'unknown',
      file_size_mb: Number((file.size / 1024 / 1024).toFixed(2)),
    });

    try {
      setProgressLog((prev) => [...prev, '[0.0s] Connecting to UniWave backend...']);
      const instrumentId = await api.getDefaultInstrumentId();
      if (!instrumentId) throw new Error('No active instrument is available in backend');

      setProgressLog((prev) => [...prev, '[0.4s] Uploading audio to Render backend...']);
      const result = await api.transcribeToSong(file, {
        instrumentId,
        onProgress: (percent) => {
          setUploadPercent(percent);
          if (percent >= 99) {
            setPhase('processing');
            setActiveStep(2);
            setProgressLog((prev) => {
              if (prev.some((line) => line.includes('AI service is processing'))) return prev;
              return [...prev, '[1.0s] AI service is processing audio on EC2...'];
            });
          }
        },
      });

      const finalSong = result.song.notes.length
        ? result.song
        : {
            ...result.song,
            notes: songsData[0].notes,
            duration: songsData[0].duration,
          };

      setUploadPercent(100);
      setTranscribedSong(finalSong);
      setGeneratedSheetId(result.generationId);
      setProgressLog((prev) => [
        ...prev,
        '[ready] MIDI score downloaded from backend.',
        '[ready] Notes mapped into the Melodix simulator.',
      ]);
      setActiveStep(7);
      setPhase('success');
      trackEvent('audio_transcription_complete', {
        generation_id: result.generationId,
        instrument_name: result.upload.instrument?.name || 'unknown',
        note_count: finalSong.notes.length,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI transcription failed';
      trackEvent('audio_transcription_error', { error_message: message });
      setUploadError(message);
      setProgressLog((prev) => [...prev, `[error] ${message}`]);
      setPhase('idle');
    }
  };

  const startProcessing = () => {
    setProgressLog([]);
    setActiveStep(0);

    const logs = [
      'Initializing UniWave AI Music Model...',
      'Deep-scanning audio waveform spectrum...',
      'Identifying instrument harmonics & overtones...',
      'Transcribing notes & estimating temporal grid...',
      'Synthesizing pitch signature ledgers...',
      'Calibrating virtual playboards & notations...',
      'Sheet Music generation complete!'
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setProgressLog(prev => [...prev, `[${(index * 0.8).toFixed(1)}s] ${log}`]);
        setActiveStep(index + 1);

        if (index === logs.length - 1) {
          setTimeout(() => {
            setPhase('success');
          }, 600);
        }
      }, (index + 1) * 800);
    });
  };

  const openMelodix = () => {
    if (!transcribedSong) return;
    trackEvent('open_simulator', {
      event_source: 'audio_upload_success',
      song_title: transcribedSong.title,
    });
    onTranscriptionComplete(transcribedSong);
    window.location.hash = '#simulator';
  };

  const runSuccessAction = (message: string) => {
    setProgressLog(prev => [...prev, `[ready] ${message}`]);
  };

  const exportGeneratedSheet = async () => {
    if (!generatedSheetId) {
      runSuccessAction('No generated PDF was returned for this transcription.');
      return;
    }

    try {
      const pdfBlob = await api.downloadGeneratedPdf(generatedSheetId);
      const objectUrl = URL.createObjectURL(pdfBlob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      trackEvent('download_generated_sheet', { generation_id: generatedSheetId, file_type: 'pdf' });
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    } catch (error) {
      runSuccessAction(error instanceof Error ? error.message : 'Could not open generated PDF.');
    }
  };

  return (
    <main className="upload-page">
      {/* Decorative orbs */}
      <div className="upload-page-orb upload-page-orb-1" aria-hidden="true" />
      <div className="upload-page-orb upload-page-orb-2" aria-hidden="true" />
      <div className="upload-page-orb upload-page-orb-3" aria-hidden="true" />

      {/* Back button */}
      <a className="upload-back-link" href="#home" aria-label="Back to UniWave home">
        <img src={logoUrl} alt="UniWave" />
      </a>

      {/* Main glass card */}
      <motion.div
        className="upload-glass-container"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="upload-header">
          <div className="upload-header-left">
            <h2>
              AI Audio to Sheet
              <span>Powered by UniWave Studio</span>
            </h2>
          </div>
          {phase === 'idle' && (
            <a href="#home" className="upload-close-btn" aria-label="Close">
              <XIcon className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* IDLE state: upload form */}
        {phase === 'idle' && (
          <>
            {/* Dropzone */}
            {!file ? (
              <>
                <div
                  id="upload-dropzone"
                  className={`upload-dropzone ${isDragging ? 'upload-dropzone-active' : ''}`}
                  onDragOver={dragOverHandler}
                  onDragLeave={dragLeaveHandler}
                  onDrop={dropHandler}
                >
                  <input
                    id="upload-file-input"
                    type="file"
                    accept="audio/*, .mid, .midi"
                    onChange={handleFileSelect}
                    className="hidden"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="upload-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="upload-dropzone-icon">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="upload-dropzone-title">Drag & Drop Audio / MIDI</div>
                    <div className="upload-dropzone-subtitle">Supports MP3, WAV, FLAC, or MIDI files</div>
                    <span className="upload-browse-btn">
                      <FileAudio className="w-3.5 h-3.5" />
                      Browse Files
                    </span>
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                  <button
                    id="use-demo-file-btn"
                    onClick={() => {
                      const dummyFile = new File(["mock"], "luxury_viet_folk_remix.mp3", { type: "audio/mp3" });
                      setFile(dummyFile);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6366f1',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Or use a demo audio track (luxury_viet_folk_remix.mp3)
                  </button>
                </div>
              </>
            ) : (
              <div className="upload-file-info">
                <div className="upload-file-icon-wrap">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div className="upload-file-details">
                  <div className="upload-file-name">{file.name}</div>
                  <div className="upload-file-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to transcribe
                  </div>
                </div>
                <button
                  className="upload-file-remove"
                  onClick={() => setFile(null)}
                  aria-label="Remove file"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Prompt */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="upload-prompt-label">
                Transcription Instructions <span>(Optional)</span>
              </label>
              <textarea
                id="upload-prompt-textarea"
                className="upload-prompt-textarea"
                placeholder="e.g. Focus on melody extraction, optimize for piano playback, increase tempo accuracy..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                rows={2}
              />
            </div>

            {uploadError && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: 0 }}>{uploadError}</p>
            )}

            {/* Submit */}
            <button
              id="upload-submit-btn"
              className={`upload-submit-btn ${file ? 'upload-submit-btn-active' : 'upload-submit-btn-disabled'}`}
              onClick={startTranscription}
              disabled={!file}
            >
              TRANSCRIBE WITH AI
            </button>
          </>
        )}

        {/* UPLOADING state */}
        {phase === 'uploading' && (
          <>
            {file && (
              <div className="upload-file-info">
                <div className="upload-file-icon-wrap">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div className="upload-file-details">
                  <div className="upload-file-name">{file.name}</div>
                  <div className="upload-file-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
            )}
            <div className="upload-progress-wrap">
              <div className="upload-progress-top">
                <div className="upload-progress-label">
                  <Loader2 className="w-4 h-4" style={{ animation: 'spin-smooth 1.4s linear infinite' }} />
                  Uploading...
                </div>
                <div className="upload-progress-percent">{uploadPercent}%</div>
              </div>
              <div className="upload-progress-bar">
                <div
                  className="upload-progress-fill"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>
            </div>
          </>
        )}

        {/* PROCESSING state */}
        {phase === 'processing' && (
          <>
            <div className="upload-processing-center">
              <div className="upload-processing-spinner">
                <Loader2 className="w-7 h-7" />
              </div>
              <div className="upload-processing-title">UniWave AI Transcribing...</div>
              <div className="upload-processing-subtitle">Analyzing spectral overtones and generating sheet music</div>
            </div>

            {/* Step dots */}
            <div className="upload-step-dots">
              {Array.from({ length: 7 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`upload-step-dot ${idx < activeStep ? 'upload-step-dot-active' : ''}`}
                />
              ))}
            </div>

            {/* Terminal log */}
            <div className="upload-terminal">
              {progressLog.map((log, lIdx) => (
                <div key={lIdx} className="upload-terminal-line">
                  <div className="upload-terminal-check">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{log}</span>
                </div>
              ))}
              <div className="upload-terminal-pulse">
                ■ SCANNING AUDIO HARMONICS...
              </div>
            </div>
          </>
        )}

        {/* SUCCESS state */}
        {phase === 'success' && (
          <div className="upload-success-wrap">
            <div className="upload-success-icon">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="upload-success-title">Sheet Music Ready!</div>
            <div className="upload-success-subtitle">
              Your audio has been transcribed into playable sheet music.
              Open the Melodix Simulator to start performing with virtual instruments.
            </div>
            <div className="upload-success-actions" aria-label="Sheet music actions">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPromptInput('');
                  setProgressLog([]);
                  setActiveStep(0);
                  setUploadPercent(0);
                  setTranscribedSong(null);
                  setGeneratedSheetId(null);
                  setUploadError('');
                  setPhase('idle');
                }}
              >
                <FileText className="w-4 h-4" />
                New
              </button>
              <button type="button" onClick={() => runSuccessAction('Sheet music details saved to your profile.')}>
                <Save className="w-4 h-4" />
                Save
              </button>
              <button type="button" onClick={() => runSuccessAction('Share link copied to clipboard!')}>
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                type="button"
                className="upload-success-action-primary"
                onClick={exportGeneratedSheet}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <button className="upload-success-btn" onClick={openMelodix}>
              <Music className="w-5 h-5" />
              Open Instrument Simulator
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}

function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 78%', 'end 45%'],
  });

  return (
    <section ref={sectionRef} id="how-it-works-section" className="process-section">
      <div className="process-shell">
        <motion.div
          className="process-kicker"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          / OUR PROCESS
        </motion.div>

        <motion.h2
          className="process-heading"
          initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, amount: 0.45 }}
        >
          How UniWave transforms sounds, references and ideas into playable creative sessions
        </motion.h2>

        <div className="process-roadmap">
          <svg className="process-path" viewBox="0 0 1000 1060" preserveAspectRatio="none" aria-hidden="true">
            <path
              d="M880 20 H280 C50 20 50 300 280 300 H700 C950 300 950 580 700 580 H280 C50 580 50 860 280 860 H500 C620 860 620 1020 500 1020"
              className="process-path-base"
            />
            <motion.path
              d="M880 20 H280 C50 20 50 300 280 300 H700 C950 300 950 580 700 580 H280 C50 580 50 860 280 860 H500 C620 860 620 1020 500 1020"
              className="process-path-fill"
              pathLength={1}
              style={{ pathLength: scrollYProgress, pathSpacing: 1 }}
            />
          </svg>

          {HOW_STEPS.map((step, i) => {
            return (
              <motion.article
                key={step.title}
                className={`process-step process-step-${i + 1}`}
                initial={{ opacity: 0, y: 36, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.65, delay: 0.12, ease: 'easeOut' }}
                viewport={{ once: true, amount: 0.4 }}
              >
                <div className="process-step-pill">/ {step.eyebrow}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LogoMark() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const notes = ['♩', '♪', '♫', '♬', '𝅘𝅥𝅮'];

  const spawnNote = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const note = document.createElement('span');
    const driftX = (Math.random() - 0.5) * 46;
    const startX = Math.random() * 50 - 6;

    note.className = 'music-note';
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    note.style.left = `${startX}px`;
    note.style.top = '-2px';
    note.style.color = Math.random() > 0.5 ? '#2979ff' : '#00e5c8';
    note.style.setProperty('--dx1', `${driftX * 0.3}px`);
    note.style.setProperty('--dx2', `${driftX * 0.72}px`);
    note.style.setProperty('--dx3', `${driftX}px`);
    note.style.setProperty('--rot', `${Math.random() * 34 - 17}deg`);

    wrapper.appendChild(note);
    requestAnimationFrame(() => note.classList.add('active'));
    note.addEventListener('animationend', () => note.remove(), { once: true });
  };

  const handleLogoHover = () => {
    Array.from({ length: 4 }).forEach((_, i) => {
      window.setTimeout(spawnNote, i * 120);
    });
  };

  return (
    <div
      ref={wrapperRef}
      id="logomark"
      className="navbar-logo-wrapper"
      onMouseEnter={handleLogoHover}
      onFocus={handleLogoHover}
      tabIndex={0}
      aria-label="UniWave home"
    >
      <img src={logoUrl} alt="UniWave" className="navbar-logo-image" />
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.77l-.44 2.91h-2.33V22C18.34 21.25 22 17.08 22 12.06Z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 2c.34 2.92 2 4.66 4.82 4.84v3.28a8.23 8.23 0 0 1-4.78-1.4v6.15c0 4.35-2.64 7.13-6.64 7.13-3.38 0-6.15-2.38-6.15-5.82 0-3.73 2.88-6.06 6.82-5.79v3.45c-1.76-.27-3.3.58-3.3 2.18 0 1.45 1.16 2.36 2.56 2.36 1.68 0 2.76-.98 2.76-3.23V2h3.91Z" />
    </svg>
  );
}

export default function App() {
  const [pageView, setPageView] = useState<PageView>(getPageFromHash);
  const [transcribedSong, setTranscribedSong] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);
  const [mainContentReady, setMainContentReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => api.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => api.getStoredCurrentUser());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoBgRef = useRef<HTMLDivElement>(null);
  const videoScrollWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAnalytics();
    const handleHashChange = () => setPageView(getPageFromHash());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    trackPageView(pageView);
  }, [pageView]);

  useEffect(() => {
    let cancelled = false;
    const syncAuthState = async () => {
      const authenticated = api.isAuthenticated();
      setIsLoggedIn(authenticated);

      if (!authenticated) {
        setCurrentUser(null);
        return;
      }

      const storedUser = api.getStoredCurrentUser();
      if (storedUser) setCurrentUser(storedUser);

      try {
        const user = await api.getCurrentUser();
        if (!cancelled) setCurrentUser(user);
      } catch {
        if (!cancelled) setCurrentUser(storedUser);
      }
    };

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('uniwave-auth-change', syncAuthState);
    syncAuthState();

    return () => {
      cancelled = true;
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('uniwave-auth-change', syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (pageView !== 'admin') return;
    if (!isLoggedIn) {
      window.location.hash = '#signin';
      return;
    }

    if (currentUser && currentUser.role !== 'admin') {
      window.location.hash = '#home';
    }
  }, [pageView, isLoggedIn, currentUser]);

  const handleSignOut = () => {
    trackEvent('logout');
    api.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsUserMenuOpen(false);
    setTranscribedSong(null);
    window.dispatchEvent(new Event('uniwave-auth-change'));
    window.location.hash = '#home';
  };

  useEffect(() => {
    if (!introFinished) return;
    const timer = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(timer);
  }, [introFinished]);

  useEffect(() => {
    if (!introFinished) return;

    const video = videoRef.current;
    if (!video) return;

    const freezeFrame = () => {
      video.pause();
      if (video.readyState >= 2) {
        video.currentTime = Math.min(0.12, Math.max(0, video.duration - 0.1));
      }
    };

    video.addEventListener('loadeddata', freezeFrame, { once: true });
    if (video.readyState >= 2) freezeFrame();

    return () => {
      video.removeEventListener('loadeddata', freezeFrame);
    };
  }, [introFinished]);

  useEffect(() => {
    const timer = setTimeout(() => setMainContentReady(true), 1300);
    return () => clearTimeout(timer);
  }, []);

  // Effect 1 — Cinematic parallax mouse coordination centered strictly around the floating vinyl platter
  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const strength = 10; // Perfectly balanced 8-12px range as requested

    const handleMouseMove = (e: MouseEvent) => {
      // Disable/greatly reduce on mobile devices
      if (window.innerWidth <= 768) {
        targetX = 0;
        targetY = 0;
        return;
      }

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;

      targetX = ((e.clientX - cx) / cx) * strength;
      targetY = ((e.clientY - cy) / cy) * strength;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    // Add additional safeguard event receiver for document level leave
    document.addEventListener('mouseleave', handleMouseLeave);

    let animationId: number;
    const updateParallax = () => {
      // Lag factor of 0.08 produces beautiful liquid inertia feel
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (videoBgRef.current) {
        gsap.set(videoBgRef.current, { 
          x: currentX, 
          y: currentY,
          rotationX: 0, // Keep perfectly flat to prevent any extra rotation
          rotationY: 0
        });
      }

      animationId = requestAnimationFrame(updateParallax);
    };

    animationId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Effect 2 — Scroll-reactive video blur & opacity for cinematic section transitions
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      // Begin transition at 30% scroll past hero, complete by full viewport scroll
      const progress = Math.min(1, Math.max(0, (scrollY - vh * 0.3) / (vh * 0.7)));

      if (videoScrollWrapRef.current) {
        const blur = progress * 36; // 0 → 36px blur
        const opacity = 1 - progress * 0.8; // 1 → 0.2 opacity
        videoScrollWrapRef.current.style.filter = `blur(${blur}px)`;
        videoScrollWrapRef.current.style.opacity = `${opacity}`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pageView === 'signup') {
    return <AuthPage mode="signup" />;
  }

  if (pageView === 'signin') {
    return <AuthPage mode="signin" />;
  }

  if (pageView === 'contact') {
    return <ContactPage />;
  }

  if (pageView === 'upload') {
    return <UploadPage onTranscriptionComplete={(song) => setTranscribedSong(song)} />;
  }

  if (pageView === 'simulator') {
    return <MelodixApp initialSong={transcribedSong} onBack={() => { window.location.hash = '#upload'; }} />;
  }

  if (pageView === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <>
      {!introFinished && (
        <EntranceAnimation onComplete={() => setIntroFinished(true)} canProceed={mainContentReady} />
      )}
      
      <>
      {/* ═══ Fixed cinematic video backdrop — persists across all scroll sections ═══ */}
      <div
        id="fixed-video-backdrop"
        ref={videoScrollWrapRef}
        className="fixed-video-backdrop"
      >
        <div className="hero-video-wrap">
          <div
            id="video-parallax-container"
            ref={videoBgRef}
            className="relative w-[min(70vw,680px)] aspect-square flex items-center justify-center"
          >
            {/* Subtle elegant drop shadow on the central vinyl platter artifact */}
            <div className="absolute inset-4 rounded-full bg-[#0F172A]/5 blur-2xl z-0" />
            
            <div className="hero-vinyl-disc relative z-10 h-full w-full rounded-full">
              <video 
                id="background-video-source"
                ref={videoRef}
                src={VIDEO_SRC} 
                muted 
                playsInline 
                preload="auto" 
                crossOrigin="anonymous" 
                className="hero-vinyl-video opacity-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Scrollable page content ═══ */}
      <div id="uniwave-luxury-root" className="text-[#0F172A] font-body relative select-none w-screen">
        
        {/* ═══ HERO SECTION ═══ */}
        <section id="hero-section" className="hero min-h-screen relative overflow-hidden">
          {/* Decorative luxury overlay accents */}
          <div 
            id="cinematic-white-vignette"
            className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 pointer-events-none z-15" 
          />
          <div 
            id="cinematic-acoustics-grid"
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.015)_1.2px,transparent_1.2px)] bg-[size:40px_40px] opacity-75 pointer-events-none z-15" 
          />

          {/* Premium Light Glass Navigation Pill */}
          <nav 
            id="main-navigation-pill"
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap"
          >
            <div 
              id="nav-inner-pill"
              className="liquid-glass flex items-center gap-6 rounded-full px-4 py-2.5 shadow-lg shadow-slate-200/50"
            >
              <LogoMark />
              
              <div 
                id="nav-links-container"
                className="flex items-center gap-5"
              >
                {NAV_LINKS.map((link) => (
                  <a 
                    key={link}
                    id={`nav-link-${link.toLowerCase()}`}
                    href={`#${link.toLowerCase()}`}
                    className="text-sm font-body font-light text-[#0F172A]/70 hover:text-[#0F172A] transition-colors duration-200"
                  >
                    {link}
                  </a>
                ))}
              </div>

              <div 
                id="nav-auth-cluster"
                className="relative flex items-center gap-3 ml-4"
              >
                {isLoggedIn ? (
                  <>
                    <button
                      id="nav-user-avatar-button"
                      type="button"
                      onClick={() => setIsUserMenuOpen((open) => !open)}
                      className="h-9 w-9 rounded-full bg-[#0F172A] text-white border border-white/70 shadow-sm shadow-slate-200/70 flex items-center justify-center transition-all duration-200 hover:scale-[1.04] hover:shadow-md active:scale-[0.97] cursor-pointer"
                      aria-label="Open user menu"
                      aria-expanded={isUserMenuOpen}
                    >
                      <UserCircle2 className="h-5 w-5" />
                    </button>

                    {isUserMenuOpen && (
                      <div
                        id="nav-user-menu"
                        className="absolute right-0 top-[calc(100%+10px)] w-48 rounded-xl border border-[#0F172A]/10 bg-white/95 p-1.5 shadow-xl shadow-slate-300/40 backdrop-blur-md"
                      >
                        <a
                          href="#upload"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A]/80 hover:bg-[#0F172A]/5 hover:text-[#0F172A] transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </a>
                        {isAdmin && (
                          <a
                            href="#admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A]/80 hover:bg-[#0F172A]/5 hover:text-[#0F172A] transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[#0F172A]/80 hover:bg-[#0F172A]/5 hover:text-[#0F172A] transition-colors cursor-pointer"
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                        <div className="my-1 h-px bg-[#0F172A]/10" />
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <a 
                      id="nav-signin-link"
                      href="#signin" 
                      className="text-sm font-body font-light text-[#0F172A]/70 hover:text-[#0F172A] transition-colors duration-200"
                    >
                      Sign in
                    </a>
                    <a 
                      id="nav-tryfree-button"
                      href="#signup" 
                      className="bg-[#0F172A] text-white text-sm font-body font-medium rounded-full px-4 py-1.5 transition-all duration-200 hover:scale-[1.04] hover:bg-[#0F172A]/90 hover:shadow-[0_4px_12px_rgba(15,23,42,0.15)] active:scale-[0.97] flex items-center gap-1 group"
                    >
                      Try it free
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </nav>

          {/* Luxury Audio Hero Overlapping Text Branding (Z-20 layers explicitly in front of vinyl) */}
          <div 
            id="hero-content-wrap"
            className="absolute inset-0 flex flex-col items-center justify-center z-25 pointer-events-none select-none"
          >
            <div
              ref={titleRef}
              className="flex flex-col items-center justify-center pointer-events-none"
            >
              {/* Floating audio unit indicator */}
              <div 
                id="brand-mark-indicator"
                className={`flex items-center gap-2 mb-2 bg-white/70 px-3.5 py-1.5 rounded-full border border-[#0F172A]/8 text-[10px] font-mono tracking-[0.25em] text-[#0F172A]/80 font-medium shadow-sm transition-all duration-1000 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <Disc className="w-3.5 h-3.5 text-[#0F172A] animate-spin" style={{ animationDuration: '6s' }} />
                <span>STUDIO PLATES</span>
              </div>

              {/* Big elegant display font overlapping the record */}
              <h1 
                className={`hero-title select-none font-heading tracking-tight transition-all duration-1000 ${
                  mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
                }`}
              >
                UniWave
              </h1>
              
              {/* Subtle high-end creative typography subline */}
              <p 
                className={`font-dirtyline text-xs uppercase tracking-[0.38em] text-[#0F172A]/70 font-semibold mt-3 transition-all duration-1000 delay-200 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Hear it. Play it. Instantly
              </p>
            </div>
          </div>

          {/* Functional Bottom Row controls and centered action deck */}
          <motion.div 
            id="hero-bottom-row-container"
            className={`absolute bottom-12 left-0 right-0 px-10 flex items-end justify-between z-30 transition-all duration-1000 delay-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            initial={{ opacity: 0, y: 40 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Left acoustic description */}
            <motion.p 
              id="bottom-left-description"
              className="text-sm font-body font-light text-[#0F172A]/70 max-w-52.5 leading-relaxed select-none hidden md:block"
              initial={{ opacity: 0, x: -40 }}
              animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              UniWave's acoustic AI model understands rhythm, harmonics, and sonic aesthetics like a master producer.
            </motion.p>

            {/* Center operational controls deck */}
            <motion.div 
              id="bottom-center-actions-wrapper"
              className="absolute left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center gap-4 w-[90%] md:w-auto"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <motion.div 
                id="center-buttons-flex"
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.button 
                  id="primary-generate-button"
                  className="group relative bg-[#0F172A] text-white text-sm font-body font-medium rounded-full px-6 py-3 overflow-hidden active:scale-[0.97] transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.03] flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    Start listening
                  </span>
                  <span className="absolute inset-0 bg-linear-to-b from-slate-800 to-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </motion.button>

                <motion.button 
                  id="secondary-templates-button"
                  className="liquid-glass group text-[#0F172A] text-sm font-body font-medium rounded-full px-6 py-3 active:scale-[0.97] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_4px_12px_rgba(15,23,42,0.05)] flex items-center gap-2 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span>See consoles</span>
                  <ArrowRight className="w-4 h-4 text-[#0F172A]/70 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right acoustic description */}
            <motion.p 
              id="bottom-right-description"
              className="text-sm font-body font-light text-[#0F172A]/75 max-w-[210px] leading-relaxed text-right select-none hidden md:block"
              initial={{ opacity: 0, x: 40 }}
              animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              Describe the auditory soundscapes in your head — build tracks that express your vision flawlessly.
            </motion.p>
          </motion.div>
        </section>

        {/* ═══ HOW IT WORKS SECTION ═══ */}
        <section className="who-section" id="who-we-are">
          <div className="who-shell">
              <motion.div
                className="who-copy"
                initial={{ opacity: 0, y: 34, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.35 }}
              >
                <div className="who-pill">/ WHO WE ARE</div>
                <h2>A music intelligence studio helping creators shape sound with clarity.</h2>
                <p>
                  UniWave is built by a small team focused on audio, design, and generative systems. We turn raw references, moods, and ideas into practical creative direction for modern music experiences.
                </p>
                <a href="#benefits">Learn More</a>
              </motion.div>
          </div>
        </section>

        <ProcessSection />

        <section className="benefits-section" id="benefits">
          <div className="benefits-shell">
            <motion.div
              className="benefits-kicker"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span />
              Benefits
            </motion.div>

            <motion.h2
              className="benefits-heading"
              initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, amount: 0.4 }}
            >
              Turn every sound idea into momentum <span>with tools that understand<br />how music feels.</span>
            </motion.h2>

            <div className="benefits-grid">
              {BENEFITS.map((benefit, i) => {
                const Icon = benefit.icon;
                return (
                  <motion.article
                    key={benefit.title}
                    className="benefit-card"
                    initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.55, delay: i * 0.07, ease: 'easeOut' }}
                    viewport={{ once: true, amount: 0.25 }}
                  >
                    <div className="benefit-icon">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <PricingSection />

        <WaveformHero />

        <footer className="site-footer">
          <div className="footer-top">
            <div className="footer-newsletter">
              <h2>Join our newsletter</h2>
              <p>
                Sign up to our mailing list below and be the first to know
                about new drops. No noise, just useful updates.
              </p>
              <form className="footer-form">
                <input type="email" placeholder="you@uniwave.audio" aria-label="Email address" />
                <button type="submit">Submit</button>
              </form>
            </div>

            <nav className="footer-link-grid" aria-label="Footer navigation">
              {FOOTER_LINK_GROUPS.map((group) => (
                <div key={group.title} className="footer-link-group">
                  <h3>{group.title}</h3>
                  {group.links.map((link) => (
                    <a key={link} href={`#${link.toLowerCase().replaceAll(' ', '-')}`}>
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </nav>
          </div>

          <div className="footer-brand" aria-label="UniWave">
            UNIWAVE
          </div>

          <div className="footer-bottom">
            <div className="footer-socials" aria-label="Social links">
              <a
                href="https://www.facebook.com/profile.php?id=61590329885936"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@uniwave7"
                aria-label="TikTok"
                target="_blank"
                rel="noreferrer"
              >
                <TikTokIcon className="h-5 w-5" />
              </a>
            </div>

            <p>© 2026 UniWave Studio. Created for immersive audio.</p>
          </div>
        </footer>
      </div>
      </>
    </>
  );
}
