const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const ATTRIBUTION_STORAGE_KEY = 'uniwave_attribution';
const LAST_TOUCH_STORAGE_KEY = 'uniwave_last_touch_attribution';

const TRACKED_QUERY_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'ttclid',
  'msclkid',
] as const;

type TrackedQueryParam = (typeof TRACKED_QUERY_PARAMS)[number];

type AttributionRecord = Partial<Record<TrackedQueryParam, string>> & {
  landing_page: string;
  referrer?: string;
  captured_at: string;
};

type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __uniwaveGaInitialized?: boolean;
  }
}

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function readStoredAttribution() {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AttributionRecord) : null;
  } catch {
    return null;
  }
}

function toGaParams(record: AttributionRecord | null): AnalyticsParams {
  if (!record) return {};

  return {
    campaign_source: record.utm_source,
    campaign_medium: record.utm_medium,
    campaign_name: record.utm_campaign,
    campaign_term: record.utm_term,
    campaign_content: record.utm_content,
    gclid: record.gclid,
    gbraid: record.gbraid,
    wbraid: record.wbraid,
    fbclid: record.fbclid,
    ttclid: record.ttclid,
    msclkid: record.msclkid,
    landing_page: record.landing_page,
    original_referrer: record.referrer,
  };
}

export function captureMarketingAttribution() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const attribution = TRACKED_QUERY_PARAMS.reduce<Partial<Record<TrackedQueryParam, string>>>(
    (acc, key) => {
      const value = params.get(key);
      if (value) acc[key] = value;
      return acc;
    },
    {},
  );

  const hasCampaignParams = Object.keys(attribution).length > 0;
  if (!hasCampaignParams) return readStoredAttribution();

  const record: AttributionRecord = {
    ...attribution,
    landing_page: getCurrentPath(),
    referrer: document.referrer || undefined,
    captured_at: new Date().toISOString(),
  };

  localStorage.setItem(LAST_TOUCH_STORAGE_KEY, JSON.stringify(record));
  if (!localStorage.getItem(ATTRIBUTION_STORAGE_KEY)) {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(record));
  }

  return record;
}

export function initializeAnalytics() {
  if (typeof window === 'undefined') return;

  captureMarketingAttribution();

  if (!GA_MEASUREMENT_ID || window.__uniwaveGaInitialized) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });

  window.__uniwaveGaInitialized = true;
}

export function trackPageView(pageName: string) {
  if (typeof window === 'undefined') return;

  captureMarketingAttribution();

  window.gtag?.('event', 'page_view', {
    page_title: `${document.title || 'UniWave'} - ${pageName}`,
    page_location: window.location.href,
    page_path: getCurrentPath(),
    page_name: pageName,
    ...toGaParams(readStoredAttribution()),
  });
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return;

  window.gtag?.('event', eventName, {
    ...toGaParams(readStoredAttribution()),
    ...params,
  });
}

export function getMarketingAttributionPayload() {
  const attribution = readStoredAttribution();
  if (!attribution) return undefined;

  return {
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_term: attribution.utm_term,
    utm_content: attribution.utm_content,
    landing_page: attribution.landing_page,
    referrer: attribution.referrer,
    gclid: attribution.gclid,
    fbclid: attribution.fbclid,
    ttclid: attribution.ttclid,
    msclkid: attribution.msclkid,
  };
}

export function buildUtmUrl(
  baseUrl: string,
  params: {
    source: string;
    medium: string;
    campaign: string;
    term?: string;
    content?: string;
  },
) {
  const url = new URL(baseUrl);
  url.searchParams.set('utm_source', params.source);
  url.searchParams.set('utm_medium', params.medium);
  url.searchParams.set('utm_campaign', params.campaign);
  if (params.term) url.searchParams.set('utm_term', params.term);
  if (params.content) url.searchParams.set('utm_content', params.content);
  return url.toString();
}
