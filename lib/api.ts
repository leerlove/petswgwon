import type { Place, BlogReview, NearbyPlace } from '@/types';

export interface MagazineIssueResponse {
  theme: {
    id: string;
    title: string;
    subtitle: string;
    summary: string;
    emoji: string;
    coverImage: string;
    gradient: string;
    accentColor: string;
    season: string;
  };
  places: Place[];
  placeCount: number;
}

export interface MagazineResponse {
  periodLabel: string;
  nextRotation: string;
  mode: string;
  issues: MagazineIssueResponse[];
}

const BASE = '/api';
const DEFAULT_TIMEOUT = 10000;

const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60_000;

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown) {
  apiCache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithTimeout(url: string, options?: RequestInit, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function parseJSON<T>(res: Response, validate?: (data: unknown) => boolean): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new Error('응답 데이터를 파싱할 수 없습니다.');
  }
  if (validate && !validate(data)) {
    throw new Error('응답 데이터 형식이 올바르지 않습니다.');
  }
  return data as T;
}

const isArray = (d: unknown): boolean => Array.isArray(d);
const isObject = (d: unknown): boolean => d !== null && typeof d === 'object' && !Array.isArray(d);

export interface FetchPlacesParams {
  category?: string;
  sub_category?: string;
  bounds?: { swLat: number; swLng: number; neLat: number; neLng: number };
  petSize?: string;
  indoor?: boolean | null;
}

export interface FetchPlacesResult {
  places: Place[];
  total: number;
}

export async function fetchPlaces(params?: FetchPlacesParams): Promise<FetchPlacesResult> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.sub_category) query.set('sub_category', params.sub_category);
  if (params?.bounds) {
    query.set('swLat', String(params.bounds.swLat));
    query.set('swLng', String(params.bounds.swLng));
    query.set('neLat', String(params.bounds.neLat));
    query.set('neLng', String(params.bounds.neLng));
  }
  if (params?.petSize && params.petSize !== 'all') query.set('petSize', params.petSize);
  if (params?.indoor === true) query.set('indoor', 'true');
  else if (params?.indoor === false) query.set('indoor', 'false');

  const res = await fetchWithTimeout(`${BASE}/places?${query}`, undefined, 15000);
  return parseJSON<FetchPlacesResult>(res, isObject);
}

export async function fetchPlaceDetail(id: string): Promise<{
  place: Place;
  reviews: BlogReview[];
  nearby: NearbyPlace[];
}> {
  const res = await fetchWithTimeout(`${BASE}/places/${encodeURIComponent(id)}`);
  return parseJSON(res, isObject);
}

export async function searchPlaces(q: string, category?: string): Promise<Place[]> {
  const cacheKey = `search:${q}:${category ?? ''}`;
  const cached = getCached<Place[]>(cacheKey);
  if (cached) return cached;

  const query = new URLSearchParams({ q });
  if (category && category !== 'all') query.set('category', category);

  const res = await fetchWithTimeout(`${BASE}/places/search?${query}`);
  const result = await parseJSON<Place[]>(res, isArray);
  setCache(cacheKey, result);
  return result;
}

export async function fetchReviews(placeId: string): Promise<BlogReview[]> {
  const res = await fetchWithTimeout(`${BASE}/places/${encodeURIComponent(placeId)}/reviews`);
  return parseJSON<BlogReview[]>(res, isArray);
}

export async function createReview(
  placeId: string,
  data: { summary: string; content: string; author: string }
): Promise<BlogReview> {
  const res = await fetchWithTimeout(`${BASE}/places/${encodeURIComponent(placeId)}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseJSON<BlogReview>(res, isObject);
}

export async function fetchMagazine(mode: 'biweekly' | 'monthly' = 'biweekly', count = 3): Promise<MagazineResponse> {
  const query = new URLSearchParams({ mode, count: String(count) });
  const res = await fetchWithTimeout(`${BASE}/magazine?${query}`);
  return parseJSON<MagazineResponse>(res, isObject);
}

export async function toggleBookmark(placeId: string): Promise<{ bookmarked: boolean }> {
  const res = await fetchWithTimeout(`${BASE}/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placeId }),
  });
  return parseJSON(res, isObject);
}
