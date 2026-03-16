const STORAGE_KEY = 'petzone_recent_places';
const MAX_RECENT = 10;

export interface RecentPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  viewedAt: number;
}

export function getRecentPlaces(): RecentPlace[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is RecentPlace =>
        typeof p === 'object' && p !== null && typeof p.id === 'string'
    ).slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function addRecentPlace(place: { id: string; name: string; category: string; address: string }) {
  try {
    const list = getRecentPlaces().filter((p) => p.id !== place.id);
    list.unshift({ ...place, viewedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch { /* localStorage disabled */ }
}

export function clearRecentPlaces() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* localStorage disabled */ }
}
