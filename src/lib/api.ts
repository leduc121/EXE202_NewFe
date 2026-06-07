import { parseMidiToSong } from './midi';
import type { Song } from '../melo/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://exe202-be.onrender.com').replace(/\/$/, '');
const AI_BASE_URL = (import.meta.env.VITE_AI_API_URL || 'http://47.129.211.133').replace(/\/$/, '');

const ACCESS_TOKEN_KEYS = ['access_token', 'accessToken', 'token'];
const REFRESH_TOKEN_KEYS = ['refresh_token', 'refreshToken'];

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
};

export type Instrument = {
  id: string;
  name: string;
  slug?: string;
};

export type AuthResponse = {
  user: unknown;
  access_token: string;
  refresh_token: string;
};

export type AudioUploadResponse = {
  id: string;
  originalFilename: string;
  processingStatus: string;
  processingError?: string | null;
  instrument?: Instrument;
  sheetGeneration?: {
    id: string;
    title?: string | null;
    keySignature?: string | null;
    timeSignature?: string | null;
    tempoBpm?: number | null;
  };
};

function getStoredToken() {
  for (const key of ACCESS_TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }
  return null;
}

function persistAuthTokens(auth: AuthResponse) {
  localStorage.setItem('access_token', auth.access_token);
  localStorage.setItem('accessToken', auth.access_token);
  localStorage.setItem('token', auth.access_token);
  localStorage.setItem('refresh_token', auth.refresh_token);
  localStorage.setItem('refreshToken', auth.refresh_token);
}

function clearAuthTokens() {
  [...ACCESS_TOKEN_KEYS, ...REFRESH_TOKEN_KEYS].forEach((key) => localStorage.removeItem(key));
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      (typeof payload === 'string' && payload) ||
      response.statusText ||
      'API request failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}

async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getStoredToken();

  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  return unwrapResponse<T>(response);
}

function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  onProgress?: (percent: number) => void,
) {
  return new Promise<T>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}${path}`);

    const token = getStoredToken();
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };

    request.onload = () => {
      const response = new Response(request.responseText, {
        status: request.status,
        statusText: request.statusText,
        headers: { 'Content-Type': request.getResponseHeader('Content-Type') || 'application/json' },
      });
      unwrapResponse<T>(response).then(resolve).catch(reject);
    };

    request.onerror = () => reject(new Error('Cannot reach backend API'));
    request.send(formData);
  });
}

export const api = {
  apiBaseUrl: API_BASE_URL,
  aiBaseUrl: AI_BASE_URL,
  isAuthenticated: () => Boolean(getStoredToken()),
  logout: clearAuthTokens,

  async register(fullName: string, email: string, password: string) {
    return apiFetch<{ success: boolean; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
  },

  async login(email: string, password: string) {
    const auth = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    persistAuthTokens(auth);
    return auth;
  },

  async getInstruments() {
    return apiFetch<Instrument[]>('/instruments');
  },

  async getDefaultInstrumentId() {
    const instruments = await this.getInstruments();
    const preferred = instruments.find((instrument) => {
      const value = `${instrument.slug || ''} ${instrument.name}`.toLowerCase();
      return value.includes('piano') || value.includes('dan-tranh') || value.includes('dan tranh');
    });
    return (preferred || instruments[0])?.id;
  },

  async uploadAudioForSheet(
    file: File,
    instrumentId: string,
    onProgress?: (percent: number) => void,
  ) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('instrumentId', instrumentId);
    return uploadWithProgress<AudioUploadResponse>('/audio-uploads', formData, onProgress);
  },

  async downloadGeneratedMidi(generationId: string) {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/sheet-generations/${generationId}/midi/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      throw new Error(detail || 'Could not download generated MIDI');
    }

    return response.arrayBuffer();
  },

  async downloadGeneratedPdf(generationId: string) {
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}/sheet-generations/${generationId}/pdf/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => response.statusText);
      throw new Error(detail || 'Could not download generated PDF');
    }

    return response.blob();
  },

  pdfUrl(generationId: string) {
    return `${API_BASE_URL}/sheet-generations/${generationId}/pdf/file`;
  },

  async transcribeToSong(
    file: File,
    options: {
      instrumentId: string;
      instrumentName?: string;
      onProgress?: (percent: number) => void;
    },
  ): Promise<{ upload: AudioUploadResponse; song: Song; generationId: string; pdfUrl?: string }> {
    const upload = await this.uploadAudioForSheet(file, options.instrumentId, options.onProgress);
    const generationId = upload.sheetGeneration?.id;
    if (!generationId) throw new Error(upload.processingError || 'Backend did not return a sheet generation');

    const midi = await this.downloadGeneratedMidi(generationId);
    const title = upload.sheetGeneration?.title || file.name.replace(/\.[^/.]+$/, '') || 'Transcribed Song';
    const song = parseMidiToSong(midi, title, upload.instrument?.name || options.instrumentName || 'Piano');

    if (upload.sheetGeneration?.tempoBpm) song.tempo = upload.sheetGeneration.tempoBpm;
    if (upload.sheetGeneration?.timeSignature) song.timeSignature = upload.sheetGeneration.timeSignature;
    if (upload.sheetGeneration?.keySignature) song.key = upload.sheetGeneration.keySignature;

    return {
      upload,
      song,
      generationId,
      pdfUrl: this.pdfUrl(generationId),
    };
  },

  async checkAiHealth() {
    const response = await fetch(`${AI_BASE_URL}/health`);
    return unwrapResponse<{ ok: boolean; service: string }>(response);
  },
};
