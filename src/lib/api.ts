import { parseMidiToSong } from './midi';
import type { Song } from '../melo/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://exe202-be.onrender.com').replace(/\/$/, '');
const AI_BASE_URL = (import.meta.env.VITE_AI_API_URL || 'http://47.129.211.133').replace(/\/$/, '');

const ACCESS_TOKEN_KEYS = ['access_token', 'accessToken', 'token'];
const REFRESH_TOKEN_KEYS = ['refresh_token', 'refreshToken'];
const CURRENT_USER_KEY = 'uniwave_current_user';

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

export type CurrentUser = {
  id: string;
  fullName: string;
  displayName?: string | null;
  email: string;
  role: string;
  status: string;
  subscription: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  authProvider?: string;
  mustSetPassword?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
};

export type AuthResponse = {
  user: CurrentUser;
  access_token: string;
  refresh_token: string;
};

export type MarketingAttributionPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing_page?: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
};

export type AdminSummary = {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  paidUsers: number;
  activeSubscriptions: number;
  paymentsCount: number;
  successfulPayments: number;
  totalRevenue: number;
  uploadsCount: number;
  aiJobsCount: number;
  completedGenerations: number;
  failedGenerations: number;
};

export type FinancialOverview = {
  range: string;
  revenueOverview: {
    totalRevenue: number;
    monthly: Array<{ month: string; label: string; revenue: number }>;
  };
  costsBreakdown: {
    totalCosts: number;
    monthly: Array<{
      month: string;
      label: string;
      cogs: number;
      operatingExpenses: number;
      totalCosts: number;
    }>;
  };
  cards: {
    grossRevenue: number;
    netProfit: number;
    refundRate: number;
    avgTransaction: number;
  };
};

export type MarketingAttributionSummary = {
  campaigns: Array<{ source: string; medium: string; campaign: string; users: number }>;
  sources: Array<{ source: string; users: number }>;
};

export type AdminTransaction = {
  id: string;
  transactionId: string;
  customerName: string;
  customerEmail: string | null;
  amount: number;
  currency: string;
  type: string;
  paymentMethod: string;
  status: string;
  planName: string | null;
  date: string;
  checkoutUrl?: string | null;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  subscription: string;
  createdAt: string;
  lastLoginAt: string | null;
  attribution?: {
    source: string;
    medium: string;
    campaign: string;
    landingPage: string | null;
  } | null;
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
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(auth.user));
}

function clearAuthTokens() {
  [...ACCESS_TOKEN_KEYS, ...REFRESH_TOKEN_KEYS].forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(CURRENT_USER_KEY);
}

function readStoredCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

async function unwrapResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      payload?.message ||
      (typeof payload?.error === 'object' ? payload.error?.message || payload.error?.error : payload?.error) ||
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

function isNonWhitelistedAttributionError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return message.includes('property attribution should not exist');
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
  getStoredCurrentUser: readStoredCurrentUser,
  isStoredAdmin: () => readStoredCurrentUser()?.role === 'admin',
  logout: clearAuthTokens,

  async register(
    fullName: string,
    email: string,
    password: string,
    attribution?: MarketingAttributionPayload,
  ) {
    const payload = { fullName, email, password, attribution };

    try {
      return await apiFetch<{ success: boolean; email: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (!attribution || !isNonWhitelistedAttributionError(error)) throw error;

      return apiFetch<{ success: boolean; email: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password }),
      });
    }
  },

  async login(email: string, password: string, attribution?: MarketingAttributionPayload) {
    let auth: AuthResponse;

    try {
      auth = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, attribution }),
      });
    } catch (error) {
      if (!attribution || !isNonWhitelistedAttributionError(error)) throw error;

      auth = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    }

    persistAuthTokens(auth);
    return auth;
  },

  async getSubscriptionPlans() {
    return apiFetch<any[]>('/subscription-plans');
  },

  async createPayment(planId: string, method = 'payos') {
    return apiFetch<any>('/payments', {
      method: 'POST',
      body: JSON.stringify({ planId, method }),
    });
  },

  async updateProfile(dto: { fullName?: string; displayName?: string; avatarUrl?: string }) {
    const user = await apiFetch<CurrentUser>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async changePassword(dto: { currentPassword?: string; newPassword: string }) {
    return apiFetch<{ success: boolean }>('/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  async createSupportTicket(dto: { subject: string; message: string; priority?: string }) {
    return apiFetch<any>('/support-tickets', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  async getInstruments() {
    return apiFetch<Instrument[]>('/instruments');
  },

  async getCurrentUser() {
    const user = await apiFetch<CurrentUser>('/users/me');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async getAdminSummary() {
    return apiFetch<AdminSummary>('/dashboard/admin/summary');
  },

  async getAdminFinancials(range = '1y') {
    return apiFetch<FinancialOverview>(`/dashboard/admin/financials?range=${encodeURIComponent(range)}`);
  },

  async getAdminMarketingAttribution(limit = 8) {
    return apiFetch<MarketingAttributionSummary>(
      `/dashboard/admin/marketing-attribution?limit=${encodeURIComponent(String(limit))}`,
    );
  },

  async getAdminTransactions(limit = 5) {
    return apiFetch<{ items: AdminTransaction[]; pagination: unknown }>(
      `/payments/admin/transactions?limit=${encodeURIComponent(String(limit))}`,
    );
  },

  async getAdminUsers() {
    return apiFetch<AdminUser[]>('/users');
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
